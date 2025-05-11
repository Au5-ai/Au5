//https://meet.google.com/uir-miof-cby
import {pipeAsync} from "./core/pipeline";
import {ChromeBrowserService} from "./services/browser.service";
import {AppConfiguration, ConfigurationService} from "./services/config.service";
import {StorageService} from "./services/storage.service";
import {ExtensionMessageType, IBrowserService, MeetingPipelineContext, TranscriptBlock} from "./types";
import {applyDomStyle, findDom, selectElements, waitForElement} from "./utils/dom.utils";
import {getMeetingTitleFromUrl} from "./utils/urlHelper";

let appConfig: AppConfiguration;
const broserService = new ChromeBrowserService();
const configService = new ConfigurationService(new StorageService());

let hasMeetingEnded = false;
let transcriptBlock: TranscriptBlock[] = [];
let currentSpeakerName = "",
  currentTranscript = "",
  currentTimestamp = "";

// DOM state flags
let isTranscriptDomErrorCaptured = false;

// Observers
let transcriptObserver: MutationObserver;
let hasMeetingStarted = false;

const initServices = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  appConfig = await configService.getConfig();
  ctx.meetingTitle = getMeetingTitleFromUrl();
  return ctx;
};

const activateCaptions = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  const captionsIcon = appConfig.Extension.captionsIcon;
  ctx.captionsButton = selectElements(captionsIcon.selector, captionsIcon.text)[0];
  ctx.captionsButton?.click();
  return ctx;
};

const findTranscriptContainer = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  const dom = findDom(appConfig.Extension.transcriptSelectors.aria, appConfig.Extension.transcriptSelectors.fallback);
  if (!dom) throw new Error("Transcript container not found in DOM");
  ctx.transcriptContainer = dom.container;
  ctx.canUseAriaBasedTranscriptSelector = dom.useAria;
  return ctx;
};

const applyTranscriptStyle = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  if (ctx.transcriptContainer) {
    applyDomStyle(
      ctx.transcriptContainer,
      ctx.canUseAriaBasedTranscriptSelector,
      appConfig.Extension.transcriptStyles.opacity
    );
  }
  return ctx;
};

const observeTranscriptContainer = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
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

const finalize = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  endMeetingRoutines();
  return ctx;
};

async function startMeetingRoutines(browserService: IBrowserService): Promise<void> {
  try {
    await waitForElement(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
    browserService.sendMessage({type: ExtensionMessageType.MEETING_STARTED});
    hasMeetingStarted = true;
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}

startMeetingRoutines(broserService)
  .then(async () => {
    return pipeAsync<MeetingPipelineContext>(
      {} as MeetingPipelineContext,
      initServices,
      activateCaptions,
      findTranscriptContainer,
      applyTranscriptStyle,
      observeTranscriptContainer,
      finalize
    );
  })
  .catch(error => {
    console.error("Meeting routine execution failed:", error);
    isTranscriptDomErrorCaptured = true;
  });

function createMutationHandler(ctx: MeetingPipelineContext) {
  return function (mutations: MutationRecord[], observer: MutationObserver) {
    handleTranscriptMutations(mutations, ctx);
  };
}

function handleTranscriptMutations(mutations: MutationRecord[], ctx: MeetingPipelineContext): void {
  for (const _ of mutations) {
    try {
      const transcriptContainer = ctx.canUseAriaBasedTranscriptSelector
        ? document.querySelector<HTMLElement>(appConfig.Extension.transcriptSelectors.aria)
        : document.querySelector<HTMLElement>(appConfig.Extension.transcriptSelectors.fallback);

      const speakerElements = ctx.canUseAriaBasedTranscriptSelector
        ? transcriptContainer?.children
        : transcriptContainer?.childNodes[1]?.firstChild?.childNodes;

      if (!speakerElements) return;

      const hasSpeakers = ctx.canUseAriaBasedTranscriptSelector
        ? speakerElements.length > 1
        : speakerElements.length > 0;

      if (!hasSpeakers) {
        if (currentSpeakerName && currentTranscript) {
          flushTranscriptBuffer(currentSpeakerName, currentTranscript, currentTimestamp);
        }
        currentSpeakerName = "";
        currentTranscript = "";
        continue;
      }

      const latestSpeakerElement = ctx.canUseAriaBasedTranscriptSelector
        ? (speakerElements[speakerElements.length - 2] as HTMLElement)
        : (speakerElements[speakerElements.length - 1] as HTMLElement);

      const nameNode = latestSpeakerElement.childNodes[0] as HTMLElement;
      const textNode = latestSpeakerElement.childNodes[1]?.lastChild as HTMLElement;

      const speakerName = nameNode?.textContent?.trim() ?? "";
      const transcriptText = textNode?.textContent?.trim() ?? "";

      if (!speakerName || !transcriptText) continue;

      if (currentTranscript === "") {
        // New conversation start
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;
      } else if (currentSpeakerName !== speakerName) {
        // New speaker
        flushTranscriptBuffer(currentSpeakerName, currentTranscript, currentTimestamp);
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;
      } else {
        // Same speaker continuing
        if (ctx.canUseAriaBasedTranscriptSelector) {
          const textDiff = transcriptText.length - currentTranscript.length;
          if (textDiff < -appConfig.Extension.maxTranscriptLength) {
            flushTranscriptBuffer(currentSpeakerName, currentTranscript, currentTimestamp);
          }
        }

        currentTranscript = transcriptText;

        if (!ctx.canUseAriaBasedTranscriptSelector && transcriptText.length > appConfig.Extension.maxTranscriptLength) {
          latestSpeakerElement.remove();
        }
      }

      // Debug log
      console.log(
        currentTranscript.length > appConfig.Extension.transcriptTrimThreshold
          ? `${currentTranscript.slice(0, 50)} ... ${currentTranscript.slice(-50)}`
          : currentTranscript
      );
    } catch (err) {
      console.error(err);
      if (!isTranscriptDomErrorCaptured && !hasMeetingEnded) {
        console.log("Error in transcript mutation observer:", err);
      }
      isTranscriptDomErrorCaptured = true;
    }
  }
}

function flushTranscriptBuffer(speakerName: string, transcript: string, timestamp: string): void {
  if (!currentTranscript || !currentTimestamp) return;
  const name = speakerName === "You" ? appConfig.Service.fullName : speakerName;
  transcriptBlock.push({
    speaker: name,
    timestamp: currentTimestamp,
    transcript: transcript
  });

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
        flushTranscriptBuffer();
      }

      console.log("Meeting ended. Transcript data:", JSON.stringify(transcript));
    });
  } catch (err) {
    console.error("Error setting up meeting end listener:", err);
  }
}
