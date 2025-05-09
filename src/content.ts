//https://meet.google.com/uir-miof-cby
import {ChromeBrowserService} from "./services/browser.service";
import {ExtensionMessageType, IBrowserService, IconData, TranscriptBlock} from "./types";
import {selectElements, waitForElement} from "./utils/dom.utils";
import {Logger} from "./utils/logger";
import {CONFIG} from "./constants";

let userName = CONFIG.userName;
let hasMeetingStarted = false;
let meetingTitle = "";
let hasMeetingEnded = false;

const meetingEndIcon: IconData = CONFIG.meetingEndIcon;
const captionsIcon: IconData = CONFIG.captionsIcon;

export async function meetingRoutines(browserService: IBrowserService): Promise<void> {
  try {
    await waitForElement(meetingEndIcon.selector, meetingEndIcon.text);
    browserService.sendMessage({type: ExtensionMessageType.MEETING_STARTED});
    hasMeetingStarted = true;
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}

declare const extensionStatusJSON_bug: string;
const mutationConfig: MutationObserverInit = {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true
};

// DOM state flags
let canUseAriaBasedTranscriptSelector = true;
let isTranscriptDomErrorCaptured = false;

// Observers
let transcriptObserver: MutationObserver;
let chatMessagesObserver: MutationObserver;

meetingRoutines(new ChromeBrowserService())
  .then(() => {
    Logger.info(getMeetingTitleFromUrl() ?? "No meeting title found", "meetingRoutines");

    try {
      const captionsButton = selectElements(captionsIcon.selector, captionsIcon.text)[0];
      captionsButton?.click();

      const transcriptContainer = findTranscriptContainer();
      if (!transcriptContainer) {
        throw new Error("Transcript container not found in DOM");
      }

      applyTranscriptStyle(transcriptContainer);
      observeTranscript(transcriptContainer);
    } catch (error) {
      console.error("Transcript initialization error:", error);
      isTranscriptDomErrorCaptured = true;
    }
  })
  .catch(error => {
    console.error("Meeting routine execution failed:", error);
  });

/** Locates the appropriate transcript container and sets the flag. */
function findTranscriptContainer(): HTMLElement | null {
  let container = document.querySelector<HTMLElement>(CONFIG.transcriptSelectors.ariaBased);
  canUseAriaBasedTranscriptSelector = Boolean(container);

  if (!container) {
    container = document.querySelector<HTMLElement>(CONFIG.transcriptSelectors.fallback);
  }

  return container;
}

/** Applies visual styles to the transcript container for debugging/user clarity. */
function applyTranscriptStyle(container: HTMLElement): void {
  if (canUseAriaBasedTranscriptSelector) {
    container.style.opacity = CONFIG.transcriptStyles.opacity;
  } else {
    const innerElement = container.children[1] as HTMLElement | undefined;
    innerElement?.setAttribute("style", `opacity: ${CONFIG.transcriptStyles.opacity};`);
  }
}

/** Starts observing the transcript container for mutation changes. */
function observeTranscript(container: HTMLElement): void {
  transcriptObserver = new MutationObserver(handleTranscriptMutations);
  transcriptObserver.observe(container, mutationConfig);
}

function getMeetingTitleFromUrl(): string | null {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const meetingId = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
  return meetingId;
}

let currentSpeakerName = "",
  currentTranscript = "",
  currentTimestamp = "";

function handleTranscriptMutations(mutations: MutationRecord[]): void {
  for (const _ of mutations) {
    try {
      const transcriptContainer = canUseAriaBasedTranscriptSelector
        ? document.querySelector<HTMLElement>(CONFIG.transcriptSelectors.ariaBased)
        : document.querySelector<HTMLElement>(CONFIG.transcriptSelectors.fallback);

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
          if (textDiff < -CONFIG.maxTranscriptLength) {
            flushTranscriptBuffer(); // Transcript reset fallback
          }
        }

        currentTranscript = transcriptText;

        if (!canUseAriaBasedTranscriptSelector && transcriptText.length > CONFIG.maxTranscriptLength) {
          console.log("Transcript text too long, trimming...");
          latestSpeakerElement.remove(); // Google Meet UI workaround
        }
      }

      // Debug log
      console.log(
        currentTranscript.length > CONFIG.transcriptTrimThreshold
          ? `${currentTranscript.slice(0, 50)} ... ${currentTranscript.slice(-50)}`
          : currentTranscript
      );
    } catch (err) {
      console.error(err);
      if (!isTranscriptDomErrorCaptured && !hasMeetingEnded) {
        console.log(CONFIG.reportErrorMessage);
      }
      isTranscriptDomErrorCaptured = true;
    }
  }
}

// Transcript array that holds one or more transcript blocks
let transcript: TranscriptBlock[] = [];

function flushTranscriptBuffer(): void {
  if (!currentTranscript || !currentTimestamp) return;

  const name = currentSpeakerName === "You" ? userName : currentSpeakerName;

  transcript.push({
    personName: name,
    timestamp: currentTimestamp,
    text: currentTranscript
  });

  //overWriteChromeStorage(["transcript"], false);
}
