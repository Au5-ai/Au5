import {IBrowserInjector} from "../types/browser";

export class DomUtils {
  constructor(private browserInjector: IBrowserInjector) {}

  /**
   * Waits for an element matching the selector and optional exact text.
   * Uses `requestAnimationFrame` for efficient polling.
   *
   * @param selector - CSS selector string
   * @param text - Optional exact text content to match
   * @returns Promise resolving with the matching HTMLElement
   */
  async waitForMatch(selector: string, text?: string): Promise<HTMLElement> {
    const matchesText = (el: Element): boolean => (text ? el.textContent?.trim() === text : true);

    while (true) {
      const elements = Array.from(document.querySelectorAll(selector));
      const matched = elements.find(matchesText);
      if (matched instanceof HTMLElement) return matched;

      await new Promise(requestAnimationFrame);
    }
  }

  /**
   * Selects a single HTMLElement matching the selector.
   *
   * @param selector - CSS selector string
   * @returns The matching HTMLElement or null
   */
  selectSingle(selector: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(selector);
  }

  /**
   * Selects all HTMLElements matching the selector and optional regex text.
   *
   * @param selector - CSS selector string
   * @param textPattern - Optional regex pattern to match text content
   * @returns Array of matching HTMLElements
   */
  selectAll(selector: string, textPattern?: string): HTMLElement[] {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!textPattern) return elements;

    const regex = new RegExp(textPattern);
    return elements.filter(el => regex.test(el.textContent ?? ""));
  }

  /**
   * Applies an opacity style to a target container or its second child.
   *
   * @param container - The parent HTMLElement
   * @param applyToSelf - If true, applies style to container; otherwise, to second child
   * @param opacity - Opacity value (e.g., "0.5")
   */
  setOpacity(container: HTMLElement, applyToSelf: boolean, opacity: string): void {
    if (applyToSelf) {
      container.style.opacity = opacity;
    } else {
      const target = container.children[1] as HTMLElement | undefined;
      target?.style.setProperty("opacity", opacity);
    }
  }

  /**
   * Attempts to locate a DOM container using aria selector, falling back to a secondary selector.
   *
   * @param ariaSelector - ARIA-based CSS selector
   * @param fallbackSelector - Fallback CSS selector
   * @returns Object with container and flag indicating if ARIA selector was used
   */
  getDomContainer(ariaSelector: string, fallbackSelector: string): {container: HTMLElement | null; usedAria: boolean} {
    const container = document.querySelector<HTMLElement>(ariaSelector);
    if (container) return {container, usedAria: true};

    return {
      container: document.querySelector<HTMLElement>(fallbackSelector),
      usedAria: false
    };
  }

  injectScript(fileName: string, onLoad: () => void = () => {}): void {
    this.browserInjector.inject(fileName, onLoad);
  }

  /**
   * Extracts caption data from a given block element.
   *
   * @param block - The block element containing caption data.
   * @returns An object containing the block ID, speaker name, image URL, and text content.
   */
  extractCaptionData(block: Element): any {
    const blockId = block.getAttribute("data-blockid")!;
    const img = block.querySelector("img");
    const nameSpan = block.querySelector("span");
    const textDiv = Array.from(block.querySelectorAll("div")).find(
      d => d.childElementCount === 0 && d.textContent?.trim()
    );

    return {
      blockId,
      speakerName: nameSpan?.textContent?.trim() ?? "",
      pictureUrl: img?.getAttribute("src") ?? "",
      transcript: textDiv?.textContent?.trim() ?? ""
    };
  }
}
