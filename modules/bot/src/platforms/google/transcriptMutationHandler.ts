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
          this.handleMutations(ctx.transcriptContainer, mutations)
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
    transcriptContainer: ElementHandle<HTMLElement> | null,
    mutations: MutationRecord[]
  ): Promise<TranscriptionEntryMessage | null> {
    try {
      let captionBlock: Caption = {
        blockId: "",
        speakerName: "",
        pictureUrl: "",
        transcript: "",
      };

      for (const mutation of mutations) {
        // Handle added blocks
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const elHandle = (await this.page.evaluateHandle(
              (n) => n,
              node as unknown
            )) as unknown as ElementHandle<Element>;

            const isBlock = await this.domUtility.isCaptionBlock(
              transcriptContainer,
              elHandle
            );
            if (isBlock) {
              captionBlock = await this.domUtility.processBlock(elHandle);
            }
          }
        }

        // Handle changes in existing block's content
        const nodeHandle = (await this.page.evaluateHandle(
          (n) => n,
          mutation.target as unknown
        )) as unknown as ElementHandle<Node>;

        const rootBlock = await this.domUtility.findCaptionBlock(
          transcriptContainer,
          nodeHandle
        );

        if (rootBlock) {
          captionBlock = await this.domUtility.processBlock(rootBlock);
        }
      }

      // if (blockTranscription) {
      //   if (blockTranscription.transcript.trim() === "") {
      //     return;
      //   }

      //   if (blockTranscription.speakerName == "You") {
      //     blockTranscription.speakerName = config.user.fullName;
      //   }

      //   const block = meeting.transcripts.find(t => t.id === blockTranscription.blockId);

      //   if (block && blockTranscription.transcript.trim() == block.transcript.trim()) {
      //     return; // No change in transcript, skip processing
      //   }

      //   if (!block) {
      //     meeting.transcripts.push({
      //       id: blockTranscription.blockId,
      //       user: {
      //         fullName: blockTranscription.speakerName,
      //         pictureUrl: blockTranscription.pictureUrl
      //       },
      //       timestamp: new Date(),
      //       transcript: blockTranscription.transcript
      //     });
      //   } else {
      //     block.transcript = blockTranscription.transcript;
      //   }

      if (captionBlock && captionBlock.transcript.trim() !== "") {
        logger.info({
          type: "NotifyRealTimeTranscription",
          meetingId: "",
          transcriptBlockId: captionBlock.blockId,
          speaker: {
            fullName: captionBlock.speakerName,
            pictureUrl: captionBlock.pictureUrl,
          },
          transcript: captionBlock.transcript,
          timestamp: new Date(),
        } as TranscriptionEntryMessage);
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }
}
