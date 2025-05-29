import {Caption, IMeetingPlatform} from "../types";

export class GoogleMeet implements IMeetingPlatform {
  constructor(private url: string) {}
  getMeetingTitle(): string {
    const match = this.url.match(/meet\.google\.com\/([a-zA-Z0-9-]+)/);
    return match ? `${match[1]}` : "Google Meet";
  }

  getPlatformName(): string {
    return "GoogleMeet";
  }

  /**
   * Extracts caption data from a given block element.
   *
   * @param block - The block element containing caption data.
   * @returns An object containing the block ID, speaker name, image URL, and text content.
   */
  extractCaptionData(block: Element): Caption {
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

  isCaptionBlock = (container: HTMLElement | null, el: Element): boolean => el.parentElement === container;

  findCaptionBlock = (container: HTMLElement | null, el: Node): Element | null => {
    let current = el.nodeType === Node.ELEMENT_NODE ? (el as Element) : el.parentElement;
    while (current && current.parentElement !== container) {
      current = current.parentElement;
    }
    return current?.parentElement === container ? current : null;
  };

  processBlock = (el: Element) => {
    if (!el.hasAttribute("data-blockid")) {
      el.setAttribute("data-blockid", crypto.randomUUID());
    }
    return this.extractCaptionData(el);
  };
}
