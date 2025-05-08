//https://meet.google.com/uir-miof-cby
import {ChromeBrowserService} from "./services/browser.service";
import {ExtensionMessageType, IBrowserService, IconData, TranscriptBlock} from "./types";
import {selectElements, waitForElement} from "./utils/dom.utils";
import {Logger} from "./utils/logger";

export const CONFIG = {
  userName: "Mohammad Karimi",
  meetingEndIcon: {
    selector: ".google-symbols",
    text: "call_end"
  },
  captionsIcon: {
    selector: ".google-symbols",
    text: "closed_caption_off"
  }
};

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

meetingRoutines(new ChromeBrowserService()).then(() => {
  Logger.info(getMeetingTitleFromUrl() ?? "No meeting title found", "meetingRoutines");

  try {
    const captionsButton = selectElements(captionsIcon.selector, captionsIcon.text)[0];
    console.log("captionsButton", captionsButton);
    // Click captions icon if not in manual mode
    captionsButton?.click();

    // Try ARIA-based selector first
    let transcriptTargetNode: HTMLElement | null = document.querySelector(`div[role="region"][tabindex="0"]`);

    // Fallback for older UI
    if (!transcriptTargetNode) {
      transcriptTargetNode = document.querySelector(".a4cQT");
      canUseAriaBasedTranscriptSelector = false;
    }

    if (transcriptTargetNode) {
      // Dim down the transcript
      if (canUseAriaBasedTranscriptSelector) {
        transcriptTargetNode.setAttribute("style", "opacity: 0.2;");
      } else {
        (transcriptTargetNode.children[1] as HTMLElement)?.setAttribute("style", "opacity: 0.2;");
      }

      // Observe transcript changes
      transcriptObserver = new MutationObserver(transcriptMutationCallback);
      transcriptObserver.observe(transcriptTargetNode, mutationConfig);
    } else {
      throw new Error("Transcript element not found in DOM");
    }
  } catch (err) {
    console.error(err);
    isTranscriptDomErrorCaptured = true;
  }
});

function getMeetingTitleFromUrl(): string | null {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const meetingId = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
  return meetingId;
}

let currentSpeakerName = "",
  currentTranscript = "",
  currentTimestamp = "";

const reportErrorMessage = "There is a bug in TranscripTonic. Please report it.";
function transcriptMutationCallback(mutationsList: MutationRecord[]): void {
  mutationsList.forEach((mutation: MutationRecord) => {
    try {
      const transcriptRoot = canUseAriaBasedTranscriptSelector
        ? document.querySelector<HTMLElement>(`div[role="region"][tabindex="0"]`)
        : document.querySelector<HTMLElement>(".a4cQT");

      const people = canUseAriaBasedTranscriptSelector
        ? transcriptRoot?.children
        : transcriptRoot?.childNodes[1]?.firstChild?.childNodes;

      if (!people) return;

      const hasValidPeople = canUseAriaBasedTranscriptSelector ? people.length > 1 : people.length > 0;

      if (hasValidPeople) {
        const person = canUseAriaBasedTranscriptSelector
          ? (people[people.length - 2] as HTMLElement)
          : (people[people.length - 1] as HTMLElement);

        const nameNode = person.childNodes[0] as HTMLElement;
        const transcriptNode = person.childNodes[1]?.lastChild as HTMLElement;

        const currentPersonName = nameNode?.textContent ?? "";
        const currentTranscriptText = transcriptNode?.textContent ?? "";

        if (currentPersonName && currentTranscriptText) {
          // No previous transcript
          if (currentTranscript === "") {
            currentSpeakerName = currentPersonName;
            currentTimestamp = new Date().toISOString();
            currentTranscript = currentTranscriptText;
          } else {
            if (currentSpeakerName !== currentPersonName) {
              pushBufferToTranscript(); // Push old buffer
              currentSpeakerName = currentPersonName;
              currentTimestamp = new Date().toISOString();
              currentTranscript = currentTranscriptText;
            } else {
              // Same person continues speaking
              if (canUseAriaBasedTranscriptSelector) {
                if (currentTranscriptText.length - currentTranscript.length < -250) {
                  pushBufferToTranscript(); // Edge case: long segment reset
                }
              }

              currentTranscript = currentTranscriptText;

              if (!canUseAriaBasedTranscriptSelector && currentTranscriptText.length > 250) {
                person.remove(); // Force restart of transcript node
              }
            }
          }
        }
      } else {
        console.log("No active transcript");
        if (currentSpeakerName && currentTranscript) {
          pushBufferToTranscript();
        }
        currentSpeakerName = "";
        currentTranscript = "";
      }

      // Debug logs
      console.log(currentTranscript);
    } catch (err) {
      console.error(err);
      if (!isTranscriptDomErrorCaptured && !hasMeetingEnded) {
        console.log(reportErrorMessage);
      }
      isTranscriptDomErrorCaptured = true;
    }
  });
}

// Transcript array that holds one or more transcript blocks
let transcript: TranscriptBlock[] = [];

function pushBufferToTranscript(): void {
  if (!currentTranscript || !currentTimestamp) return;

  const name = currentSpeakerName === "You" ? userName : currentSpeakerName;

  transcript.push({
    personName: name,
    timestamp: currentTimestamp,
    text: currentTranscript
  });

  //overWriteChromeStorage(["transcript"], false);
}
