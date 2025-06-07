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
        await this.page.exposeFunction("handleTranscription", async (caption) => {
            callback({
                transcriptBlockId: caption.blockId,
                speaker: {
                    fullName: caption.speakerName,
                    pictureUrl: caption.pictureUrl,
                },
                transcript: caption.transcript,
                timestamp: new Date(),
                meetingId: "",
                type: "NotifyRealTimeTranscription",
            });
        });
        // Step 2: Attach MutationObserver in browser context
        await this.page.evaluate((element) => {
            function findClosedCaptionTab() {
                const icon = Array.from(document.querySelectorAll("[role=tab] i.google-material-icons[aria-hidden=true]")).find((el) => el.textContent === "closed_caption");
                return icon?.closest("[role=tab]") instanceof HTMLElement
                    ? icon.closest("[role=tab]")
                    : null;
            }
            function findLanguageSelectorOption(value) {
                return (document.querySelector(`[role=radio][data-value="${value}"]`) ||
                    document.querySelector(`[type=radio][name=languageRadioGroup][value="${value}"]`) ||
                    document.querySelector(`[role=option][data-value="${value}"]`) ||
                    null);
            }
            function findVisibleTabPanelCombobox() {
                const visiblePanel = Array.from(document.querySelectorAll("div[role=tabpanel]")).find((el) => el instanceof HTMLElement &&
                    (el.offsetWidth > 0 ||
                        el.offsetHeight > 0 ||
                        el.getClientRects().length > 0));
                if (!visiblePanel)
                    return null;
                const combobox = visiblePanel.querySelector("[role=combobox]");
                return combobox instanceof HTMLElement ? combobox : null;
            }
            function findCaptionsTab() {
                const match = Array.from(document.querySelectorAll("[role=tab]")).find((el) => el.textContent?.includes("Captions")) ?? null;
                return match instanceof HTMLElement ? match : null;
            }
            const findSetting = (label) => {
                const match = Array.from(document.querySelectorAll('[role*="menuitem"], [role*="button"]')).find((el) => el.textContent?.includes(label));
                return match instanceof HTMLElement ? match : null;
            };
            const findMoreOptionsButton = () => {
                const buttons = findMoreOptions("More options");
                if (buttons.length === 1)
                    return buttons[0];
                for (const button of buttons) {
                    const noParticipant = !button.closest("div[data-participant-id]");
                    const hasAutoRejoin = button.closest("div[data-is-auto-rejoin]");
                    if (noParticipant && hasAutoRejoin) {
                        return button;
                    }
                }
                return null;
            };
            const findMoreOptions = (menuLabel) => {
                const matches = document.querySelectorAll(`button[aria-label*="${menuLabel}"]`);
                if (matches.length) {
                    return Array.from(matches);
                }
                const icons = [
                    ...Array.from(document.querySelectorAll("button i.google-symbols")),
                    ...Array.from(document.querySelectorAll("button i.google-material-icons")),
                ];
                return icons
                    .filter((el) => el.textContent?.trim() === "more_vert")
                    .map((el) => el.parentElement instanceof HTMLElement ? el.parentElement : el);
            };
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
                for (const mutation of mutations) {
                    // Handle added blocks
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const el = node;
                            if (isCaptionBlock(element, el)) {
                                const captionBlock = processBlock(el);
                                if (captionBlock.transcript.trim() !== "") {
                                    // @ts-ignore
                                    window.handleTranscription(captionBlock);
                                }
                            }
                        }
                    }
                    // Handle updated blocks
                    const target = mutation.target;
                    if (target.nodeType === Node.ELEMENT_NODE) {
                        const block = findCaptionBlock(element, target);
                        if (block && isCaptionBlock(element, block)) {
                            const captionBlock = processBlock(block);
                            if (captionBlock.transcript.trim() !== "") {
                                // @ts-ignore
                                window.handleTranscription(captionBlock);
                            }
                        }
                    }
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
exports.TranscriptMutationHandler = TranscriptMutationHandler;
