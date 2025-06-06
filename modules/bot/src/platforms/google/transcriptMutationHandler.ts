import { TranscriptionEntryMessage } from "../../types";
import { ElementHandle, Page } from "playwright-core";
import { Caption, GoogleDomConfiguration, MutationContext } from "./types";
import { DomUtility } from "./domUtility";
import { logger } from "../../utils/logger";

export class TranscriptMutationHandler {
  private domUtility: DomUtility;
  constructor(private page: Page, private config: GoogleDomConfiguration) {
    this.domUtility = new DomUtility(page);
  }

  async initialize(handler: (message: TranscriptionEntryMessage) => void) {
    await this.activateCaptions();
    let ctx = await this.findTranscriptContainer();
    await this.observeTranscriptContainer(ctx, handler);
  }

  private async activateCaptions(): Promise<void> {
    const { selector, text } = this.config.captionsIcon;

    const allCaptionsButtons = await this.domUtility.selectAllElements(
      selector,
      text
    );
    const captionsButton = allCaptionsButtons[0];

    if (captionsButton) {
      await captionsButton.click();
    }
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
    transcriptContainer = dom.container;
    ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
    return ctx;
  }

  private async observeTranscriptContainer(
    ctx: MutationContext,
    handler: (message: TranscriptionEntryMessage) => void
  ): Promise<void> {
    if (ctx.transcriptContainer) {
      await this.page.evaluate((element) => {
        const observer = new MutationObserver((mutations) => {
          this.handleMutations(mutations)
            .then((result: TranscriptionEntryMessage | null) => {
              if (result) {
                handler(result);
              }
            })
            .catch((err: any) => {
              console.error("Error processing mutation:", err);
            });
        });

        observer.observe(element, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
      }, ctx.transcriptContainer);
    }
  }

  private async handleMutations(
    mutations: MutationRecord[]
  ): Promise<TranscriptionEntryMessage | null> {
    try {
      let blockTranscription: Caption = {
        blockId: "",
        speakerName: "",
        pictureUrl: "",
        transcript: "",
      };

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const elHandle = (await page.evaluateHandle(
              (n) => n,
              node as Element
            )) as unknown as ElementHandle<Element>;

            const isCaption = await domUtils.isCaptionBlock(
              transcriptContainer,
              elHandle
            );
            if (isCaption) {
              blockTranscription = await domUtils.processBlock(elHandle);
            }
          }
        }

        const rootBlockHandle = await domUtils.findCaptionBlock(
          transcriptContainer,
          mutation.target
        );

        if (rootBlockHandle) {
          blockTranscription = await domUtils.processBlock(rootBlockHandle);
        }
      }

      if (blockTranscription && blockTranscription.transcript.trim() !== "") {
        console.log({
          type: "NotifyRealTimeTranscription",
          meetingId: "kqt-byur-jya",
          transcriptBlockId: blockTranscription.blockId,
          speaker: {
            fullName: blockTranscription.speakerName,
            pictureUrl: blockTranscription.pictureUrl,
          },
          transcript: blockTranscription.transcript,
          timestamp: new Date(),
        } as TranscriptionEntryMessage);
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }
}
