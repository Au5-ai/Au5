import { EntryMessage } from "../../types";
import { Page } from "playwright-core";
import { Caption, GoogleCaptionConfiguration, MutationContext } from "./types";
import { CaptionExtractor } from "./caption-extractor";
import { logger } from "../../common/utils/logger";
import { ScreenshotManager } from "../../common/utils/screenshot";

export class CaptionMutationHandler {
  private captionExtractor: CaptionExtractor;
  private previousTranscripts: Record<string, string> = {};
  private screenshotManager: ScreenshotManager;

  constructor(private page: Page, private config: GoogleCaptionConfiguration) {
    this.captionExtractor = new CaptionExtractor(page);
    this.screenshotManager = new ScreenshotManager();
  }

  async observe(pushToHub: (message: EntryMessage) => void) {
    try {
      let ctx = await this.findTranscriptContainer();
      await this.observeTranscriptContainer(ctx, pushToHub);
    } catch (error) {
      logger.error(
        `[GoogleMeet][Observe] Failed to start transcription observation: ${error}`
      );
      throw error;
    }
  }

  private async findTranscriptContainer(): Promise<MutationContext> {
    const ctx: MutationContext = {
      transcriptContainer: null,
      canUseAriaBasedTranscriptSelector: false,
    };

    const maxRetries = 5;
    const retryDelays = [1000, 2000, 3000, 4000, 5000];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const dom = await this.captionExtractor.getCaptionContainer(
        this.config.transcriptSelectors.aria,
        this.config.transcriptSelectors.fallback
      );

      if (dom && dom.container) {
        ctx.transcriptContainer = dom.container;
        ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
        logger.info(
          `[GoogleMeet] Transcript container found on attempt ${attempt + 1}`
        );
        return ctx;
      }

      if (attempt < maxRetries - 1) {
        logger.warn(
          `[GoogleMeet] Transcript container not found, retrying in ${
            retryDelays[attempt]
          }ms (attempt ${attempt + 1}/${maxRetries})...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelays[attempt])
        );
      }
    }

    const screenshotPath = await this.screenshotManager.takeScreenshot(
      this.page,
      `transcript-not-found-${Date.now()}.png`
    );
    logger.error(
      `[GoogleMeet] Transcript container not found after ${maxRetries} attempts. Screenshot saved to: ${screenshotPath}`
    );
    throw new Error("Transcript container not found in DOM");
  }

  private async observeTranscriptContainer(
    ctx: MutationContext,
    pushToHub: (message: EntryMessage) => void
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

        pushToHub({
          blockId: caption.blockId,
          participant: {
            fullName: caption.speakerName,
            pictureUrl: caption.pictureUrl,
          },
          content: caption.transcript,
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
