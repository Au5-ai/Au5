"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionMutationHandler = void 0;
const caption_extractor_1 = require("./caption-extractor");
const logger_1 = require("../../common/utils/logger");
const screenshot_1 = require("../../common/utils/screenshot");
class CaptionMutationHandler {
    constructor(page, config) {
        this.page = page;
        this.config = config;
        this.previousTranscripts = {};
        this.captionExtractor = new caption_extractor_1.CaptionExtractor(page);
        this.screenshotManager = new screenshot_1.ScreenshotManager();
    }
    async observe(pushToHub) {
        try {
            let ctx = await this.findTranscriptContainer();
            await this.observeTranscriptContainer(ctx, pushToHub);
        }
        catch (error) {
            logger_1.logger.error(`[GoogleMeet][Observe] Failed to start transcription observation: ${error}`);
            throw error;
        }
    }
    async findTranscriptContainer() {
        const ctx = {
            transcriptContainer: null,
            canUseAriaBasedTranscriptSelector: false,
        };
        const maxRetries = 5;
        const retryDelays = [1000, 2000, 3000, 4000, 5000];
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const dom = await this.captionExtractor.getCaptionContainer(this.config.transcriptSelectors.aria, this.config.transcriptSelectors.fallback);
            if (dom && dom.container) {
                ctx.transcriptContainer = dom.container;
                ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
                logger_1.logger.info(`[GoogleMeet] Transcript container found on attempt ${attempt + 1}`);
                return ctx;
            }
            if (attempt < maxRetries - 1) {
                logger_1.logger.warn(`[GoogleMeet] Transcript container not found, retrying in ${retryDelays[attempt]}ms (attempt ${attempt + 1}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
            }
        }
        const screenshotPath = await this.screenshotManager.takeScreenshot(this.page, `transcript-not-found-${Date.now()}.png`);
        logger_1.logger.error(`[GoogleMeet] Transcript container not found after ${maxRetries} attempts. Screenshot saved to: ${screenshotPath}`);
        throw new Error("Transcript container not found in DOM");
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
