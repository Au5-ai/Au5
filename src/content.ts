//https://meet.google.com/uir-miof-cby
import {pipeAsync} from "./core/pipeline";
import {ChromeBrowserService} from "./services/browser.service";
import {AppConfiguration, ConfigurationService} from "./services/config.service";
import {StorageService} from "./services/storage.service";
import {ExtensionMessageType, IBrowserService, PipelineContext, TranscriptBlock} from "./types";
import ChatPanel from "./ui/chatPanel";
import {applyDomStyle, findDomContainer, selectElement, selectElements, waitForElement} from "./utils/dom.utils";
import {getMeetingTitleFromUrl} from "./utils/urlHelper";

let appConfig: AppConfiguration;
const browserService = new ChromeBrowserService();
const configService = new ConfigurationService(new StorageService());

let hasMeetingEnded = false;
let transcriptBlocks: TranscriptBlock[] = [];
let currentSpeakerId = "",
  currentSpeakerName = "",
  currentTranscript = "",
  currentTimestamp = "";

let isTranscriptDomErrorCaptured = false;

// Observers
let transcriptObserver: MutationObserver;

const activateCaptions = async (ctx: PipelineContext): Promise<PipelineContext> => {
  const captionsIcon = appConfig.Extension.captionsIcon;
  ctx.captionsButton = selectElements(captionsIcon.selector, captionsIcon.text)[0];
  ctx.captionsButton?.click();
  return ctx;
};

const findTranscriptContainer = async (ctx: PipelineContext): Promise<PipelineContext> => {
  const dom = findDomContainer(
    appConfig.Extension.transcriptSelectors.aria,
    appConfig.Extension.transcriptSelectors.fallback
  );
  if (!dom) throw new Error("Transcript container not found in DOM");
  ctx.transcriptContainer = dom.container;
  ctx.canUseAriaBasedTranscriptSelector = dom.useAria;
  return ctx;
};

const applyTranscriptStyle = async (ctx: PipelineContext): Promise<PipelineContext> => {
  if (ctx.transcriptContainer) {
    applyDomStyle(
      ctx.transcriptContainer,
      ctx.canUseAriaBasedTranscriptSelector,
      appConfig.Extension.transcriptStyles.opacity
    );
  }
  return ctx;
};

const observeTranscriptContainer = async (ctx: PipelineContext): Promise<PipelineContext> => {
  if (ctx.transcriptContainer) {
    transcriptObserver = new MutationObserver(createMutationHandler(ctx));
    transcriptObserver.observe(ctx.transcriptContainer, {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true
    });
  }
  return ctx;
};

const addChatPanelToUI = async (ctx: PipelineContext): Promise<PipelineContext> => {
  // await new Promise(resolve => setTimeout(resolve, 5000));
  ChatPanel.addPanel(appConfig.Service.direction);
  return ctx;
};

const finalizeMeetingRoutines = async (ctx: PipelineContext): Promise<PipelineContext> => {
  endMeetingRoutines();
  return ctx;
};

async function startMeetingRoutines(browserService: IBrowserService): Promise<void> {
  try {
    appConfig = await configService.getConfig();
    const meetingTitle = getMeetingTitleFromUrl();
    await waitForElement(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
    browserService.sendMessage({type: ExtensionMessageType.MEETING_STARTED, value: {meetingTitle}});
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}

startMeetingRoutines(browserService)
  .then(async () => {
    return pipeAsync<PipelineContext>(
      {
        hasMeetingStarted: true
      } as PipelineContext,
      activateCaptions,
      findTranscriptContainer,
      applyTranscriptStyle,
      observeTranscriptContainer,
      addChatPanelToUI,
      finalizeMeetingRoutines
    );
  })
  .catch(error => {
    console.error("Meeting routine execution failed:", error);
    isTranscriptDomErrorCaptured = true;
  });

function createMutationHandler(ctx: PipelineContext) {
  return function (mutations: MutationRecord[], observer: MutationObserver) {
    handleTranscriptMutations(mutations, ctx);
  };
}

function handleTranscriptMutations(mutations: MutationRecord[], ctx: PipelineContext): void {
  for (const _ of mutations) {
    try {
      const transcriptContainer = ctx.canUseAriaBasedTranscriptSelector
        ? selectElement(appConfig.Extension.transcriptSelectors.aria)
        : selectElement(appConfig.Extension.transcriptSelectors.fallback);

      const speakerElements = ctx.canUseAriaBasedTranscriptSelector
        ? transcriptContainer?.children
        : transcriptContainer?.childNodes[1]?.firstChild?.childNodes;

      if (!speakerElements) return;

      const hasSpeakers = ctx.canUseAriaBasedTranscriptSelector
        ? speakerElements.length > 1
        : speakerElements.length > 0;

      if (!hasSpeakers) {
        if (currentSpeakerName && currentTranscript) {
          flushTranscriptBuffer({
            speaker: currentSpeakerName,
            transcript: currentTranscript,
            timestamp: currentTimestamp
          } as TranscriptBlock);
        }
        currentSpeakerId = "";
        currentSpeakerName = "";
        currentTranscript = "";

        console.log("No speakers found in transcript container.");
        continue;
      }

      const latestSpeakerElement = ctx.canUseAriaBasedTranscriptSelector
        ? (speakerElements[speakerElements.length - 2] as HTMLElement)
        : (speakerElements[speakerElements.length - 1] as HTMLElement);

      const nameNode = latestSpeakerElement.childNodes[0] as HTMLElement;
      const textNode = latestSpeakerElement.childNodes[1]?.lastChild as HTMLElement;

      const speakerName = nameNode?.textContent?.trim() ?? "";
      const transcriptText = textNode?.textContent?.trim() ?? "";

      if (!speakerName || !transcriptText) {
        ChatPanel.addLiveMessage({
          id: currentSpeakerId,
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        });
        continue;
      }

      if (currentTranscript === "") {
        // New conversation start
        currentSpeakerId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;

        ChatPanel.addLiveMessage({
          id: currentSpeakerId,
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        });
      } else if (currentSpeakerName !== speakerName) {
        // New speaker
        flushTranscriptBuffer({
          id: currentSpeakerId,
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        } as TranscriptBlock);
        currentSpeakerId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;
        ChatPanel.addLiveMessage({
          id: currentSpeakerId,
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        });
      } else {
        // Same speaker continuing
        if (ctx.canUseAriaBasedTranscriptSelector) {
          const textDiff = transcriptText.length - currentTranscript.length;
          if (textDiff < -appConfig.Extension.maxTranscriptLength) {
            flushTranscriptBuffer({
              id: currentSpeakerId,
              speaker: currentSpeakerName,
              transcript: currentTranscript,
              timestamp: currentTimestamp
            } as TranscriptBlock);

            ChatPanel.addLiveMessage({
              id: currentSpeakerId,
              speaker: currentSpeakerName,
              transcript: currentTranscript,
              timestamp: currentTimestamp
            });
          }
        }

        currentTranscript = transcriptText;

        if (!ctx.canUseAriaBasedTranscriptSelector && transcriptText.length > appConfig.Extension.maxTranscriptLength) {
          latestSpeakerElement.remove();
        }
      }
    } catch (err) {
      console.error(err);
      if (!isTranscriptDomErrorCaptured && !hasMeetingEnded) {
        console.log("Error in transcript mutation observer:", err);
      }
      isTranscriptDomErrorCaptured = true;
    }
  }
}

function flushTranscriptBuffer(item: TranscriptBlock): void {
  if (!currentTranscript || !currentTimestamp) return;
  const name = item.speaker === "You" ? appConfig.Service.fullName : item.speaker;
  transcriptBlocks.push({
    id: item.id,
    speaker: name,
    timestamp: item.timestamp,
    transcript: item.transcript
  });
  console.log("Transcript block:", JSON.stringify(transcriptBlocks));
  //overWriteChromeStorage(["transcript"], false);
}

function endMeetingRoutines(): void {
  try {
    const elements = selectElements(
      appConfig.Extension.meetingEndIcon.selector,
      appConfig.Extension.meetingEndIcon.text
    );
    const meetingEndButton = elements?.[0]?.parentElement?.parentElement ?? null;

    if (!meetingEndButton) {
      throw new Error("Meeting end button not found in DOM.");
    }

    meetingEndButton.addEventListener("click", () => {
      hasMeetingEnded = true;
      transcriptObserver?.disconnect();
      //chatMessagesObserver?.disconnect();
      if (currentSpeakerName && currentTranscript) {
        flushTranscriptBuffer({
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        } as TranscriptBlock);
      }
      ChatPanel.destroy();
      console.log("Meeting ended. Transcript data:", JSON.stringify(transcriptBlocks));
    });
  } catch (err) {
    console.error("Error setting up meeting end listener:", err);
  }
}
