"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomUtility = void 0;
class DomUtility {
    constructor(page) {
        this.page = page;
    }
    /**
     * Selects all elements matching the selector and optional regex text.
     *
     * @param selector - CSS selector string
     * @param textPattern - Optional regex pattern to match text content
     * @returns Array of matching ElementHandles
     */
    async selectAllElements(selector, textPattern) {
        const elements = await this.page.$$(selector);
        if (!textPattern) {
            return elements;
        }
        const regex = new RegExp(textPattern);
        const matching = [];
        for (const el of elements) {
            const text = await el.textContent();
            if (text && regex.test(text)) {
                matching.push(el);
            }
        }
        return matching;
    }
    /**
     * Attempts to locate a container using an ARIA selector, falling back to a secondary CSS selector.
     *
     * @param ariaSelector - ARIA-based selector (e.g., [aria-label="Transcript"])
     * @param fallbackSelector - Fallback CSS selector
     * @returns Object with container and flag indicating if ARIA selector was used
     */
    async getCaptionContainer(ariaSelector, fallbackSelector) {
        const ariaMatch = await this.page.$(ariaSelector);
        if (ariaMatch) {
            return {
                container: ariaMatch,
                usedAria: true,
            };
        }
        const fallback = await this.page.$(fallbackSelector);
        return {
            container: fallback,
            usedAria: false,
        };
    }
    /**
     * Checks if a given element is a direct child of the container.
     */
    async isCaptionBlock(container, el) {
        if (!container)
            return false;
        const parent = await el.evaluateHandle((e) => e.parentElement);
        return await this.page.evaluate(({ parentEl, containerEl }) => parentEl === containerEl, {
            parentEl: parent,
            containerEl: container,
        });
    }
    async findCaptionBlock(container, el) {
        if (!container)
            return null;
        let current = (await this.page.evaluateHandle((node) => node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement, el));
        while (current) {
            const parentHandle = (await current.evaluateHandle((el) => el.parentElement));
            const isContainerParent = await this.page.evaluate(({ parent, containerEl }) => parent === containerEl, { parent: parentHandle, containerEl: container });
            if (isContainerParent) {
                return current;
            }
            // Convert to ElementHandle<Element> only if not null
            const parentElement = parentHandle.asElement();
            if (!parentElement)
                break;
            current = parentElement;
        }
        return null;
    }
    /**
     * Ensures the block has a data-blockid and extracts its caption data.
     */
    async processBlock(el) {
        let blockId = await el.getAttribute("data-blockid");
        if (!blockId) {
            blockId = crypto.randomUUID();
            await el.evaluate((e, id) => e.setAttribute("data-blockid", id), blockId);
        }
        return this.extractCaptionData(el);
    }
    /**
     * Extracts caption data from a given block element.
     *
     * @param block - The block element containing caption data.
     * @returns An object containing block ID, speaker name, image URL, and text content.
     */
    async extractCaptionData(block) {
        const blockId = (await block.getAttribute("data-blockid")) ?? crypto.randomUUID();
        const [img, span, divs] = await Promise.all([
            block.$("img"),
            block.$("span"),
            block.$$("div"),
        ]);
        let textDiv = null;
        for (const d of divs) {
            const childCount = await d.evaluate((el) => el.childElementCount);
            const text = await d.textContent();
            if (childCount === 0 && text?.trim()) {
                textDiv = d;
                break;
            }
        }
        const [speakerName, pictureUrl, transcript] = await Promise.all([
            span?.textContent() ?? "",
            img?.getAttribute("src") ?? "",
            textDiv?.textContent() ?? "",
        ]);
        return {
            blockId,
            speakerName: speakerName?.trim() || "UnKnown Speaker",
            pictureUrl: pictureUrl?.trim() || "",
            transcript: transcript?.trim() || "",
        };
    }
}
exports.DomUtility = DomUtility;
