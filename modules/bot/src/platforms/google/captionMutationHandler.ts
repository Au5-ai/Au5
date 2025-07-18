import { EntryMessage } from "../../types";
import { Page } from "playwright-core";
import { Caption, GoogleCaptionConfiguration, MutationContext } from "./types";
import { CaptionProcessor } from "./captionProcessor";
import { logger } from "../../utils/logger";
import { CaptionEnabler } from "./captionEnabler";

export class CaptionMutationHandler {
  private captionProcessor: CaptionProcessor;
  private previousTranscripts: Record<string, string> = {};

  constructor(private page: Page, private config: GoogleCaptionConfiguration) {
    this.captionProcessor = new CaptionProcessor(page);
  }

  async initialize(callback: (message: EntryMessage) => void) {
    await this.activateCaptions();
    let ctx = await this.findTranscriptContainer();
    await this.observeTranscriptContainer(ctx, callback);
  }

  private async activateCaptions(): Promise<void> {
    logger.info(
      `[GoogleMeet][Transcription] Activating live captions for language: ${this.config.language}`
    );
    await new CaptionEnabler(this.page).enable(this.config.language);
  }

  private async findTranscriptContainer(): Promise<MutationContext> {
    const ctx: MutationContext = {
      transcriptContainer: null,
      canUseAriaBasedTranscriptSelector: false,
    };

    const dom = await this.captionProcessor.getCaptionContainer(
      this.config.transcriptSelectors.aria,
      this.config.transcriptSelectors.fallback
    );

    if (!dom) throw new Error("Transcript container not found in DOM");
    ctx.transcriptContainer = dom.container;
    ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
    return ctx;
  }

  private async observeTranscriptContainer(
    ctx: MutationContext,
    callback: (message: EntryMessage) => void
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
        } as EntryMessage);
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
        let blockTranscription: Caption = {
          blockId: "",
          speakerName: "",
          pictureUrl: "",
          transcript: "",
        };

        for (const mutation of mutations) {
          // Handle added blocks
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
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

    logger.info("[GoogleMeet][Transcription] Mutation observer initialized.");
  }
}
