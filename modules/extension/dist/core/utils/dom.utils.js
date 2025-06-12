export class DomUtils {
    /**
     * Waits for an element matching the selector and optional exact text.
     * Uses `requestAnimationFrame` for efficient polling.
     *
     * @param selector - CSS selector string
     * @param text - Optional exact text content to match
     * @returns Promise resolving with the matching HTMLElement
     */
    async waitForMatch(selector, text) {
        const matchesText = (el) => (text ? el.textContent?.trim() === text : true);
        while (true) {
            const elements = Array.from(document.querySelectorAll(selector));
            const matched = elements.find(matchesText);
            if (matched instanceof HTMLElement)
                return matched;
            await new Promise(requestAnimationFrame);
        }
    }
    /**
     * Selects a single HTMLElement matching the selector.
     *
     * @param selector - CSS selector string
     * @returns The matching HTMLElement or null
     */
    selectSingle(selector) {
        return document.querySelector(selector);
    }
    /**
     * Selects all HTMLElements matching the selector and optional regex text.
     *
     * @param selector - CSS selector string
     * @param textPattern - Optional regex pattern to match text content
     * @returns Array of matching HTMLElements
     */
    selectAll(selector, textPattern) {
        const elements = Array.from(document.querySelectorAll(selector));
        if (!textPattern)
            return elements;
        const regex = new RegExp(textPattern);
        return elements.filter(el => regex.test(el.textContent ?? ""));
    }
    /**
     * Attempts to locate a DOM container using aria selector, falling back to a secondary selector.
     *
     * @param ariaSelector - ARIA-based CSS selector
     * @param fallbackSelector - Fallback CSS selector
     * @returns Object with container and flag indicating if ARIA selector was used
     */
    getDomContainer(ariaSelector, fallbackSelector) {
        const container = document.querySelector(ariaSelector);
        if (container)
            return { container, usedAria: true };
        return {
            container: document.querySelector(fallbackSelector),
            usedAria: false
        };
    }
}
