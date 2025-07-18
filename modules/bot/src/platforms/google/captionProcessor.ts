import { ElementHandle, Page } from "playwright";
import { Caption } from "./types";
import { logger } from "../../utils/logger";

export class CaptionProcessor {
  constructor(private page: Page) {}

  /**
   * Attempts to locate a container using an ARIA selector, falling back to a secondary CSS selector.
   *
   * @param ariaSelector - ARIA-based selector (e.g., [aria-label="Transcript"])
   * @param fallbackSelector - Fallback CSS selector
   * @returns Object with container and flag indicating if ARIA selector was used
   */
  async getCaptionContainer(
    ariaSelector: string,
    fallbackSelector: string
  ): Promise<{
    container: ElementHandle<HTMLElement> | null;
    usedAria: boolean;
  }> {
    const ariaMatch = await this.page.$(ariaSelector);
    if (ariaMatch) {
      return {
        container: ariaMatch as ElementHandle<HTMLElement>,
        usedAria: true,
      };
    }

    const fallback = await this.page.$(fallbackSelector);
    return {
      container: fallback as ElementHandle<HTMLElement> | null,
      usedAria: false,
    };
  }

  /**
   * Checks if a given element is a direct child of the container.
   */
  async isCaptionBlock(
    container: ElementHandle<HTMLElement> | null,
    el: ElementHandle<Element>
  ): Promise<boolean> {
    if (!container) return false;

    logger.info(
      `[DomUtility][isCaptionBlock] Checking if element is a caption block: ${await el.evaluate(
        (e) => e.outerHTML
      )}`
    );

    const parent = await el.evaluateHandle((e) => e.parentElement);

    return await this.page.evaluate(
      ({ parentEl, containerEl }) => parentEl === containerEl,
      {
        parentEl: parent,
        containerEl: container,
      }
    );
  }

  async findCaptionBlock(
    container: ElementHandle<HTMLElement> | null,
    el: ElementHandle<Node>
  ): Promise<ElementHandle<Element> | null> {
    if (!container) return null;

    let current: ElementHandle<Element> | null =
      (await this.page.evaluateHandle(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement,
        el
      )) as ElementHandle<Element>;

    while (current) {
      const parentHandle = (await current.evaluateHandle(
        (el) => el.parentElement
      )) as ElementHandle<Element | null>;

      const isContainerParent = await this.page.evaluate(
        ({ parent, containerEl }) => parent === containerEl,
        { parent: parentHandle, containerEl: container }
      );

      if (isContainerParent) {
        return current;
      }

      // Convert to ElementHandle<Element> only if not null
      const parentElement = parentHandle.asElement();
      if (!parentElement) break;

      current = parentElement;
    }

    return null;
  }

  /**
   * Ensures the block has a data-blockid and extracts its caption data.
   */
  async processBlock(el: ElementHandle<Element>): Promise<Caption> {
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
  private async extractCaptionData(
    block: ElementHandle<Element>
  ): Promise<Caption> {
    const blockId =
      (await block.getAttribute("data-blockid")) ?? crypto.randomUUID();

    const [img, span, divs] = await Promise.all([
      block.$("img"),
      block.$("span"),
      block.$$("div"),
    ]);

    let textDiv: ElementHandle<Element> | null = null;
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
