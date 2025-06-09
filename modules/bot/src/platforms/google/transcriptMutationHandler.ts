import { TranscriptionEntryMessage } from "../../types";
import { Page } from "playwright-core";
import { Caption, GoogleCaptionConfiguration, MutationContext } from "./types";
import { DomUtility } from "./domUtility";
import { logger } from "../../utils/logger";
import { LiveCaptionsHelper } from "./liveCaptionsHelper";

export class TranscriptMutationHandler {
  private domUtility: DomUtility;
  private previousTranscripts: Record<string, string> = {};

  constructor(private page: Page, private config: GoogleCaptionConfiguration) {
    this.domUtility = new DomUtility(page);
  }

  async initialize(callback: (message: TranscriptionEntryMessage) => void) {
    await this.activateCaptions();
    let ctx = await this.findTranscriptContainer();
    await this.observeTranscriptContainer(ctx, callback);
  }

  private async activateCaptions(): Promise<void> {
    // const { selector, text } = this.config.captionsIcon;
    // const allCaptionsButtons = await this.domUtility.selectAllElements(
    //   selector,
    //   text
    // );
    // const captionsButton = allCaptionsButtons[0];
    // if (captionsButton) {
    //   logger.info(
    //     `[GoogleMeet][Transcription] Activating captions using selector: ${selector}`
    //   );
    //   await captionsButton.click();
    // }
    logger.info(
      `[GoogleMeet][Transcription] Activating live captions for language: ${this.config.language}`
    );
    await new LiveCaptionsHelper().configureCaptions(this.config.language);
  }

  private async findTranscriptContainer(): Promise<MutationContext> {
    const ctx: MutationContext = {
      transcriptContainer: null,
      canUseAriaBasedTranscriptSelector: false,
    };

    const dom = await this.domUtility.getCaptionContainer(
      this.config.transcriptSelectors.aria,
      this.config.transcriptSelectors.fallback
    );

    if (!dom) throw new Error("Transcript container not found in DOM");
    ctx.transcriptContainer = dom.container;
    ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
    logger.info(
      `[GoogleMeet][Transcription] Transcript container found: ${
        ctx.transcriptContainer || "unknown"
      }`
    );

    return ctx;
  }

  private async observeTranscriptContainer(
    ctx: MutationContext,
    callback: (message: TranscriptionEntryMessage) => void
  ): Promise<void> {
    if (!ctx.transcriptContainer) {
      logger.error(
        "[GoogleMeet][Transcription] Transcript container is not available."
      );
      return;
    }

    await this.page.exposeFunction(
      "handleTranscription",
      async (caption: Caption) => {
        if (!caption.transcript || !caption.transcript.trim()) return;
        if (this.previousTranscripts[caption.blockId] === caption.transcript)
          return;
        this.previousTranscripts[caption.blockId] = caption.transcript;

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
        } as TranscriptionEntryMessage);
      }
    );

    // Step 2: Attach MutationObserver in browser context
    await this.page.evaluate((element) => {
      const isCaptionBlock = (
        container: HTMLElement | null,
        el: Element
      ): boolean => {
        return el.parentElement === container;
      };

      const findCaptionBlock = (
        container: HTMLElement | null,
        node: Node
      ): Element | null => {
        let current: Element | null =
          node.nodeType === Node.ELEMENT_NODE
            ? (node as Element)
            : node.parentElement;

        while (current && current.parentElement !== container) {
          current = current.parentElement;
        }

        return current?.parentElement === container ? current : null;
      };

      const extractCaptionData = (
        block: Element
      ): {
        blockId: string;
        speakerName: string;
        pictureUrl: string;
        transcript: string;
      } => {
        const blockId = block.getAttribute("data-blockid")!;
        const img = block.querySelector("img");
        const nameSpan = block.querySelector("span");
        const textDiv = Array.from(block.querySelectorAll("div")).find(
          (d) => d.childElementCount === 0 && d.textContent?.trim()
        );

        return {
          blockId,
          speakerName: nameSpan?.textContent?.trim() ?? "",
          pictureUrl: img?.getAttribute("src") ?? "",
          transcript: textDiv?.textContent?.trim() ?? "",
        };
      };

      const processBlock = (
        el: Element
      ): {
        blockId: string;
        speakerName: string;
        pictureUrl: string;
        transcript: string;
      } => {
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
              const el = node as Element;
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

    logger.info("[GoogleMeet][Transcription] Mutation observer initialized.");
  }
}
