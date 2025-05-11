//https://meet.google.com/uir-miof-cby
import {pipeAsync} from "./core/pieline";
import {ChromeBrowserService} from "./services/browser.service";
import {AppConfiguration, ConfigurationService} from "./services/config.service";
import {StorageService} from "./services/storage.service";
import {ExtensionMessageType, IBrowserService, TranscriptBlock} from "./types";
import {selectElements, waitForElement} from "./utils/dom.utils";
import {getMeetingTitleFromUrl} from "./utils/urlHelper";

let AppConfig: AppConfiguration;
let hasMeetingEnded = false;
let meetingTitle: string = "No meeting title found yet!";
let transcript: TranscriptBlock[] = [];
let currentSpeakerName = "",
  currentTranscript = "",
  currentTimestamp = "";

const mutationConfig: MutationObserverInit = {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true
};

// DOM state flags
let isTranscriptDomErrorCaptured = false;

// Observers
let transcriptObserver: MutationObserver;
let hasMeetingStarted = false;

interface MeetingPipelineContext {
  browserService: ChromeBrowserService;
  configService: ConfigurationService;
  AppConfig?: any;
  meetingTitle?: string;
  captionsButton?: HTMLElement | null;
  transcriptContainer?: HTMLElement | null;
}

const initServices = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  AppConfig = await new ConfigurationService(new StorageService()).getConfig();
  ctx.AppConfig = AppConfig;
  ctx.meetingTitle = getMeetingTitleFromUrl();
  return ctx;
};

const activateCaptions = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  const captionsIcon = ctx.AppConfig.Extension.captionsIcon;
  ctx.captionsButton = selectElements(captionsIcon.selector, captionsIcon.text)[0];
  ctx.captionsButton?.click();
  return ctx;
};

const findTranscript = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  const container = findTranscriptContainer();
  if (!container) throw new Error("Transcript container not found in DOM");
  ctx.transcriptContainer = container;
  return ctx;
};

const styleTranscript = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  if (ctx.transcriptContainer) {
    applyTranscriptStyle(ctx.transcriptContainer);
  }
  return ctx;
};

const observeTranscriptContainer = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  if (ctx.transcriptContainer) {
    observeTranscript(ctx.transcriptContainer);
  }
  return ctx;
};

const finalize = async (ctx: MeetingPipelineContext): Promise<MeetingPipelineContext> => {
  endMeetingRoutines();
  return ctx;
};

startMeetingRoutines(new ChromeBrowserService())
  .then(async () => {
    return pipeAsync<MeetingPipelineContext>(
      {
        browserService: new ChromeBrowserService(),
        configService: new ConfigurationService(new StorageService())
      },
      initServices,
      activateCaptions,
      findTranscript,
      styleTranscript,
      observeTranscriptContainer,
      finalize
    );
  })
  .catch(error => {
    console.error("Meeting routine execution failed:", error);
    isTranscriptDomErrorCaptured = true;
  });

async function startMeetingRoutines(browserService: IBrowserService): Promise<void> {
  try {
    await waitForElement(AppConfig.Extension.meetingEndIcon.selector, AppConfig.Extension.meetingEndIcon.text);
    browserService.sendMessage({type: ExtensionMessageType.MEETING_STARTED});
    hasMeetingStarted = true;
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}

function endMeetingRoutines(): void {
  try {
    const elements = selectElements(
      AppConfig.Extension.meetingEndIcon.selector,
      AppConfig.Extension.meetingEndIcon.text
    );
    const meetingEndButton = elements?.[0]?.parentElement?.parentElement ?? null;

    if (!meetingEndButton) {
      throw new Error("Meeting end button not found in DOM.");
    }

    meetingEndButton.addEventListener("click", handleMeetingEnd);
  } catch (err) {
    console.error("Error setting up meeting end listener:", err);
  }
}

/** Locates the appropriate transcript container and sets the flag. */
function findTranscriptContainer(): HTMLElement | null {
  let container = document.querySelector<HTMLElement>(AppConfig.Extension.transcriptSelectors.ariaBased);
  canUseAriaBasedTranscriptSelector = Boolean(container);

  if (!container) {
    container = document.querySelector<HTMLElement>(AppConfig.Extension.transcriptSelectors.fallback);
  }

  return container;
}

/** Applies visual styles to the transcript container for debugging/user clarity. */
function applyTranscriptStyle(container: HTMLElement): void {
  if (AppConfig.Extension.canUseAriaBasedTranscriptSelector) {
    container.style.opacity = AppConfig.Extension.transcriptStyles.opacity;
  } else {
    const innerElement = container.children[1] as HTMLElement | undefined;
    innerElement?.setAttribute("style", `opacity: ${AppConfig.Extension.transcriptStyles.opacity};`);
  }
}

/** Starts observing the transcript container for mutation changes. */
function observeTranscript(container: HTMLElement): void {
  transcriptObserver = new MutationObserver(handleTranscriptMutations);
  transcriptObserver.observe(container, mutationConfig);
}

function handleTranscriptMutations(mutations: MutationRecord[]): void {
  for (const _ of mutations) {
    try {
      const transcriptContainer = canUseAriaBasedTranscriptSelector
        ? document.querySelector<HTMLElement>(AppConfig.Extension.transcriptSelectors.ariaBased)
        : document.querySelector<HTMLElement>(AppConfig.Extension.transcriptSelectors.fallback);

      const speakerElements = canUseAriaBasedTranscriptSelector
        ? transcriptContainer?.children
        : transcriptContainer?.childNodes[1]?.firstChild?.childNodes;

      if (!speakerElements) return;

      const hasSpeakers = canUseAriaBasedTranscriptSelector ? speakerElements.length > 1 : speakerElements.length > 0;

      if (!hasSpeakers) {
        console.log("No active transcript");
        if (currentSpeakerName && currentTranscript) {
          flushTranscriptBuffer();
        }
        currentSpeakerName = "";
        currentTranscript = "";
        continue;
      }

      const latestSpeakerElement = canUseAriaBasedTranscriptSelector
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
        flushTranscriptBuffer();
        currentSpeakerName = speakerName;
        currentTimestamp = new Date().toISOString();
        currentTranscript = transcriptText;
      } else {
        // Same speaker continuing
        if (canUseAriaBasedTranscriptSelector) {
          const textDiff = transcriptText.length - currentTranscript.length;
          if (textDiff < -AppConfig.Extension.maxTranscriptLength) {
            flushTranscriptBuffer(); // Transcript reset fallback
          }
        }

        currentTranscript = transcriptText;

        if (!canUseAriaBasedTranscriptSelector && transcriptText.length > AppConfig.Extension.maxTranscriptLength) {
          console.log("Transcript text too long, trimming...");
          latestSpeakerElement.remove(); // Google Meet UI workaround
        }
      }

      // Debug log
      console.log(
        currentTranscript.length > AppConfig.Extension.transcriptTrimThreshold
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

function flushTranscriptBuffer(): void {
  if (!currentTranscript || !currentTimestamp) return;

  const name = currentSpeakerName === "You" ? AppConfig.Service.fullName : currentSpeakerName;

  transcript.push({
    personName: name,
    timestamp: currentTimestamp,
    text: currentTranscript
  });

  //overWriteChromeStorage(["transcript"], false);
}

/**
 * Handles logic to clean up and persist data when the meeting ends.
 */
function handleMeetingEnd(): void {
  hasMeetingEnded = true;

  // Disconnect observers
  transcriptObserver?.disconnect();
  //chatMessagesObserver?.disconnect();

  // Flush transcript buffer if valid
  if (currentSpeakerName && currentTranscript) {
    flushTranscriptBuffer();
  }

  console.log("Meeting ended. Transcript data:", JSON.stringify(transcript));
}
