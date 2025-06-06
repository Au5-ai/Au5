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
    async initialize(handler) {
        await this.activateCaptions();
        let ctx = await this.findTranscriptContainer();
        await this.observeTranscriptContainer(ctx, handler);
    }
    async activateCaptions() {
        const { selector, text } = this.config.captionsIcon;
        const allCaptionsButtons = await this.domUtility.selectAllElements(selector, text);
        const captionsButton = allCaptionsButtons[0];
        if (captionsButton) {
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
        return ctx;
    }
    async observeTranscriptContainer(ctx, handler) {
        if (ctx.transcriptContainer) {
            await this.page.evaluate((element) => {
                const observer = new MutationObserver((mutations) => {
                    this.handleMutations(ctx.transcriptContainer, mutations)
                        .then((result) => {
                        if (result) {
                            handler(result);
                        }
                    })
                        .catch((err) => {
                        console.error("Error processing mutation:", err);
                    });
                });
                observer.observe(element, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true,
                });
            }, ctx.transcriptContainer);
        }
    }
    async handleMutations(transcriptContainer, mutations) {
        try {
            let captionBlock = {
                blockId: "",
                speakerName: "",
                pictureUrl: "",
                transcript: "",
            };
            for (const mutation of mutations) {
                // Handle added blocks
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const elHandle = (await this.page.evaluateHandle((n) => n, node));
                        const isBlock = await this.domUtility.isCaptionBlock(transcriptContainer, elHandle);
                        if (isBlock) {
                            captionBlock = await this.domUtility.processBlock(elHandle);
                        }
                    }
                }
                // Handle changes in existing block's content
                const nodeHandle = (await this.page.evaluateHandle((n) => n, mutation.target));
                const rootBlock = await this.domUtility.findCaptionBlock(transcriptContainer, nodeHandle);
                if (rootBlock) {
                    captionBlock = await this.domUtility.processBlock(rootBlock);
                }
            }
            // if (blockTranscription) {
            //   if (blockTranscription.transcript.trim() === "") {
            //     return;
            //   }
            //   if (blockTranscription.speakerName == "You") {
            //     blockTranscription.speakerName = config.user.fullName;
            //   }
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
