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

  async initialize(callback: (message: TranscriptionEntryMessage) => void) {
    await this.activateCaptions();
    let ctx = await this.findTranscriptContainer();
    await this.observeTranscriptContainer(ctx, callback);
  }

  private async activateCaptions(): Promise<void> {
    const { selector, text } = this.config.captionsIcon;

    const allCaptionsButtons = await this.domUtility.selectAllElements(
      selector,
      text
    );
    const captionsButton = allCaptionsButtons[0];

    if (captionsButton) {
      logger.info(
        `[GoogleMeet][Transcription] Activating captions using selector: ${selector}`
      );

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

    // Step 1: Expose a function to the browser context
    await this.page.exposeFunction(
      "handleTranscriptionMutation",
      async (rawMutations: any[]) => {
        logger.info(
          "[GoogleMeet][Transcription] Mutation handler invoked with raw mutations."
        );

        try {
          const mutations = rawMutations as MutationRecord[];

          const result = await this.handleMutations(
            ctx.transcriptContainer,
            mutations
          );
          if (result) {
            callback(result);
          }
        } catch (err: any) {
          logger.error(
            `[GoogleMeet][Transcription] Error in exposed mutation handler: ${err.message}`
          );
        }
      }
    );

    // Step 2: Attach MutationObserver in browser context
    await this.page.evaluate((element) => {
      const observer = new MutationObserver((mutations) => {
        const serializedMutations = mutations.map((m) => ({
          type: m.type,
          addedNodes: Array.from(m.addedNodes).map((n) => {
            if (n.nodeType === Node.ELEMENT_NODE) {
              return (n as Element).outerHTML;
            } else if (n.nodeType === Node.TEXT_NODE) {
              return n.textContent;
            }
            return null;
          }),
          target:
            m.target.nodeType === Node.ELEMENT_NODE
              ? (m.target as Element).outerHTML
              : m.target.nodeName,
          oldValue: m.oldValue,
          attributeName: m.attributeName,
        }));

        // @ts-ignore – exposed function on Node side
        window.handleTranscriptionMutation(serializedMutations);
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

      logger.info(
        `[GoogleMeet][Transcription] Processing ${mutations.length} mutations`
      );

      for (const mutation of mutations) {
        logger.info(
          `[GoogleMeet][Transcription] Mutation detected: ${mutation.type} on ${mutation.target.nodeName}`
        );

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
              logger.info(
                "[GoogleMeet][Transcription] New caption block processed:",
                captionBlock
              );
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
          logger.info(
            "[GoogleMeet][Transcription] Existing caption block updated:",
            captionBlock
          );
        }
      }

      if (captionBlock) {
        if (captionBlock.transcript.trim() === "") {
          logger.info(
            "[GoogleMeet][Transcription] Skipping empty transcript block."
          );
          return null; // Skip empty transcripts
        }
      }
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
