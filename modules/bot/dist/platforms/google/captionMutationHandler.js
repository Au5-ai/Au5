"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionMutationHandler = void 0;
const captionProcessor_1 = require("./captionProcessor");
const logger_1 = require("../../common/utils/logger");
class CaptionMutationHandler {
    constructor(page, config) {
        this.page = page;
        this.config = config;
        this.previousTranscripts = {};
        this.captionProcessor = new captionProcessor_1.CaptionProcessor(page);
    }
    async observe(pushToHub) {
        let ctx = await this.findTranscriptContainerWithRetry();
        await this.observeTranscriptContainer(ctx, pushToHub);
    }
    async findTranscriptContainerWithRetry(maxRetries = 5, delayMs = 2000) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger_1.logger.info(`[CaptionMutationHandler] Attempting to find transcript container (${attempt}/${maxRetries})...`);
                const ctx = await this.findTranscriptContainer();
                if (ctx.transcriptContainer) {
                    logger_1.logger.info(`[CaptionMutationHandler] Transcript container found successfully using ${ctx.canUseAriaBasedTranscriptSelector ? "ARIA" : "fallback"} selector`);
                    return ctx;
                }
                throw new Error("Transcript container is null");
            }
            catch (error) {
                lastError = error;
                logger_1.logger.warn(`[CaptionMutationHandler] Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
                if (attempt < maxRetries) {
                    const waitTime = delayMs * attempt;
                    logger_1.logger.info(`[CaptionMutationHandler] Waiting ${waitTime}ms before retry...`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));
                }
            }
        }
        throw new Error(`Failed to find transcript container after ${maxRetries} attempts. Last error: ${lastError?.message}. ` +
            `This usually means captions are not enabled or the caption UI is not visible yet.`);
    }
    async findTranscriptContainer() {
        const ctx = {
            transcriptContainer: null,
            canUseAriaBasedTranscriptSelector: false,
        };
        const dom = await this.captionProcessor.getCaptionContainer(this.config.transcriptSelectors.aria, this.config.transcriptSelectors.fallback);
        if (!dom || !dom.container) {
            throw new Error("Transcript container not found in DOM");
        }
        ctx.transcriptContainer = dom.container;
        ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
        return ctx;
    }
    async observeTranscriptContainer(ctx, pushToHub) {
        if (!ctx.transcriptContainer) {
            logger_1.logger.error("[GoogleMeet][Transcription] Transcript container is not available.");
            return;
        }
        await this.page.exposeFunction("handleTranscription", async (caption) => {
            if (!caption.transcript || !caption.transcript.trim())
                return;
            if (this.previousTranscripts[caption.blockId] === caption.transcript)
                return;
            this.previousTranscripts[caption.blockId] = caption.transcript;
            pushToHub({
                blockId: caption.blockId,
                participant: {
                    fullName: caption.speakerName,
                    pictureUrl: caption.pictureUrl,
                },
                content: caption.transcript,
                timestamp: new Date(),
                meetId: "",
                entryType: "Transcription",
                type: "Entry",
            });
        });
        // Step 2: Attach MutationObserver in browser context
        await this.page.evaluate((element) => {
            const isCaptionBlock = (container, el) => {
                return el.parentElement === container;
            };
            const findCaptionBlock = (container, node) => {
                let current = node.nodeType === Node.ELEMENT_NODE
                    ? node
                    : node.parentElement;
                while (current && current.parentElement !== container) {
                    current = current.parentElement;
                }
                return current?.parentElement === container ? current : null;
            };
            const extractCaptionData = (block) => {
                const blockId = block.getAttribute("data-blockid");
                const img = block.querySelector("img");
                const nameSpan = block.querySelector("span");
                const textDiv = Array.from(block.querySelectorAll("div")).find((d) => d.childElementCount === 0 && d.textContent?.trim());
                return {
                    blockId,
                    speakerName: nameSpan?.textContent?.trim() ?? "",
                    pictureUrl: img?.getAttribute("src") ?? "",
                    transcript: textDiv?.textContent?.trim() ?? "",
                };
            };
            const processBlock = (el) => {
                if (!el.hasAttribute("data-blockid")) {
                    el.setAttribute("data-blockid", crypto.randomUUID());
                }
                return extractCaptionData(el);
            };
            const observer = new MutationObserver((mutations) => {
                let blockTranscription = {
                    blockId: "",
                    speakerName: "",
                    pictureUrl: "",
                    transcript: "",
                };
                for (const mutation of mutations) {
                    // Handle added blocks
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const el = node;
                            if (isCaptionBlock(element, el)) {
                                const captionBlock = processBlock(el);
                                if (captionBlock.transcript.trim() !== "") {
                                    blockTranscription = captionBlock;
                                }
                            }
                        }
                    }
                    // Handle updated blocks
                    const block = findCaptionBlock(element, mutation.target);
                    if (block) {
                        blockTranscription = processBlock(block);
                    }
                    if (blockTranscription.transcript.trim() == "") {
                        return;
                    }
                    // @ts-ignore
                    window.handleTranscription(blockTranscription);
                }
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
}
exports.CaptionMutationHandler = CaptionMutationHandler;
