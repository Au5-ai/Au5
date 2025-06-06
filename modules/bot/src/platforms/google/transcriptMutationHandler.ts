import { TranscriptionEntryMessage } from "../../types";
import { ElementHandle, Page } from "playwright-core";
import { Caption, GoogleDomConfiguration, MutationContext } from "./types";
import { DomUtility } from "./domUtility";
const page = document as unknown as Page;

let transcriptContainer: ElementHandle<HTMLElement> | null;
let transcriptObserver: MutationObserver;

export class TranscriptMutationHandler {
  private domUtility: DomUtility;
  constructor(private page: Page, private config: GoogleDomConfiguration) {
    this.domUtility = new DomUtility(page);
  }

  async initialize() {
    await this.activateCaptions();
    ctx = await this.findTranscriptContainer(ctx, this.config);
    ctx = await this.observeTranscriptContainer(ctx);
    return ctx;
  }

  private async activateCaptions(): Promise<void> {
    const captionsIcon = this.config.captionsIcon;
    const captionsButton = await this.domUtility.selectAllElements(
      captionsIcon.selector,
      captionsIcon.text
    )[0];
    captionsButton?.click();
  }

  private findTranscriptContainerPipe = async (
    ctx: PipelineContext
  ): Promise<PipelineContext> => {
    const dom = await domUtils.getDomContainer(
      config.transcriptSelectors.aria,
      config.transcriptSelectors.fallback
    );
    if (!dom) throw new Error("Transcript container not found in DOM");
    ctx.transcriptContainer = dom.container;
    transcriptContainer = dom.container;
    ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
    return ctx;
  };

  private observeTranscriptContainerPipe = async (
    ctx: PipelineContext
  ): Promise<PipelineContext> => {
    if (ctx.transcriptContainer) {
      transcriptObserver = new MutationObserver(createMutationHandler(ctx));
      transcriptObserver.observe(ctx.transcriptContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }
    return ctx;
  };
}

/**
 * Handles mutations observed in the transcript container and processes transcript updates.
 *
 * This function iterates over the list of mutations, extracts speaker and transcript information,
 * manages the transcript buffer, and posts updates to the window for further processing.
 * It distinguishes between new speakers, continuing speakers, and handles transcript flushing
 * when necessary. It also manages transcript length and error handling.
 *
 * @param mutations - An array of MutationRecord objects representing changes to the transcript container.
 * @param ctx - The pipeline context containing DOM references and configuration flags.
 */
function createMutationHandler(ctx: PipelineContext) {
  return function (mutations: MutationRecord[], observer: MutationObserver) {
    handleTranscriptMutations(mutations, ctx);
  };
}

async function handleTranscriptMutations(
  mutations: MutationRecord[],
  ctx: PipelineContext
): Promise<void> {
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
}
