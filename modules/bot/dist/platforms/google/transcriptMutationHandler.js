"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptMutationHandler = void 0;
const domUtility_1 = require("./domUtility");
const logger_1 = require("../../utils/logger");
class TranscriptMutationHandler {
    constructor(page, config) {
        this.page = page;
        this.config = config;
        this.domUtility = new domUtility_1.DomUtility(page);
    }
    async initialize(callback) {
        await this.activateCaptions();
        let ctx = await this.findTranscriptContainer();
        await this.observeTranscriptContainer(ctx, callback);
    }
    async activateCaptions() {
        const { selector, text } = this.config.captionsIcon;
        const allCaptionsButtons = await this.domUtility.selectAllElements(selector, text);
        const captionsButton = allCaptionsButtons[0];
        if (captionsButton) {
            logger_1.logger.info(`[GoogleMeet][Transcription] Activating captions using selector: ${selector}`);
            await captionsButton.click();
        }
    }
    async findTranscriptContainer() {
        const ctx = {
            transcriptContainer: null,
            canUseAriaBasedTranscriptSelector: false,
        };
        const dom = await this.domUtility.getCaptionContainer(this.config.transcriptSelectors.aria, this.config.transcriptSelectors.fallback);
        if (!dom)
            throw new Error("Transcript container not found in DOM");
        ctx.transcriptContainer = dom.container;
        ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
        logger_1.logger.info(`[GoogleMeet][Transcription] Transcript container found: ${ctx.transcriptContainer || "unknown"}`);
        return ctx;
    }
    async observeTranscriptContainer(ctx, callback) {
        if (!ctx.transcriptContainer) {
            logger_1.logger.error("[GoogleMeet][Transcription] Transcript container is not available.");
            return;
        }
        // Step 1: Expose a function to the browser context
        await this.page.exposeFunction("handleTranscriptionMutation", async (rawMutations) => {
            logger_1.logger.info("[GoogleMeet][Transcription] Mutation handler invoked with raw mutations.");
            try {
                const mutations = rawMutations;
                const result = await this.handleMutations(ctx.transcriptContainer, mutations);
                if (result) {
                    callback(result);
                }
            }
            catch (err) {
                logger_1.logger.error(`[GoogleMeet][Transcription] Error in exposed mutation handler: ${err.message}`);
            }
        });
        // Step 2: Attach MutationObserver in browser context
        await this.page.evaluate((element) => {
            const observer = new MutationObserver((mutations) => {
                const serializedMutations = mutations.map((m) => ({
                    type: m.type,
                    addedNodes: Array.from(m.addedNodes).map((n) => {
                        if (n.nodeType === Node.ELEMENT_NODE) {
                            return n.outerHTML;
                        }
                        else if (n.nodeType === Node.TEXT_NODE) {
                            return n.textContent;
                        }
                        return null;
                    }),
                    target: m.target.nodeType === Node.ELEMENT_NODE
                        ? m.target.outerHTML
                        : m.target.nodeName,
                    oldValue: m.oldValue,
                    attributeName: m.attributeName,
                }));
                // @ts-ignore – exposed function on Node side
                window.handleTranscriptionMutation(serializedMutations);
            });
            observer.observe(element, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
            });
        }, ctx.transcriptContainer);
        logger_1.logger.info("[GoogleMeet][Transcription] Mutation observer initialized.");
    }
    async handleMutations(transcriptContainer, mutations) {
        try {
            let captionBlock = {
                blockId: "",
                speakerName: "",
                pictureUrl: "",
                transcript: "",
            };
            logger_1.logger.info(`[GoogleMeet][Transcription] Processing ${mutations.length} mutations`);
            for (const mutation of mutations) {
                logger_1.logger.info(`[GoogleMeet][Transcription] Mutation detected: ${mutation.type}`);
                // Handle added blocks
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const elHandle = (await this.page.evaluateHandle((n) => n, node));
                        const isBlock = await this.domUtility.isCaptionBlock(transcriptContainer, elHandle);
                        if (isBlock) {
                            captionBlock = await this.domUtility.processBlock(elHandle);
                            logger_1.logger.info("[GoogleMeet][Transcription] New caption block processed:", captionBlock);
                        }
                    }
                }
                // Handle changes in existing block's content
                const nodeHandle = (await this.page.evaluateHandle((n) => n, mutation.target));
                const rootBlock = await this.domUtility.findCaptionBlock(transcriptContainer, nodeHandle);
                if (rootBlock) {
                    captionBlock = await this.domUtility.processBlock(rootBlock);
                    logger_1.logger.info("[GoogleMeet][Transcription] Existing caption block updated:", captionBlock);
                }
            }
            if (captionBlock) {
                if (captionBlock.transcript.trim() === "") {
                    logger_1.logger.info("[GoogleMeet][Transcription] Skipping empty transcript block.");
                    return null; // Skip empty transcripts
                }
            }
            //   const block = meeting.transcripts.find(t => t.id === blockTranscription.blockId);
            //   if (block && blockTranscription.transcript.trim() == block.transcript.trim()) {
            //     return; // No change in transcript, skip processing
            //   }
            //   if (!block) {
            //     meeting.transcripts.push({
            //       id: blockTranscription.blockId,
            //       user: {
            //         fullName: blockTranscription.speakerName,
            //         pictureUrl: blockTranscription.pictureUrl
            //       },
            //       timestamp: new Date(),
            //       transcript: blockTranscription.transcript
            //     });
            //   } else {
            //     block.transcript = blockTranscription.transcript;
            //   }
            if (captionBlock && captionBlock.transcript.trim() !== "") {
                logger_1.logger.info({
                    type: "NotifyRealTimeTranscription",
                    meetingId: "",
                    transcriptBlockId: captionBlock.blockId,
                    speaker: {
                        fullName: captionBlock.speakerName,
                        pictureUrl: captionBlock.pictureUrl,
                    },
                    transcript: captionBlock.transcript,
                    timestamp: new Date(),
                });
            }
        }
        catch (err) {
            console.error(err);
        }
        return null;
    }
}
exports.TranscriptMutationHandler = TranscriptMutationHandler;
