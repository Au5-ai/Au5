//https://meet.google.com/uir-miof-cby
import {ChromeBrowserService} from "./services/browser.service";
import {ExtensionMessageType, IBrowserService, IconData, TranscriptBlock} from "./types";
import {waitForElement} from "./utils/dom.utils";
import {Logger} from "./utils/logger";

let userName = "Mohammad Karimi";
let hasMeetingStarted = false;
let meetingTitle = "";
let hasMeetingEnded = false;

const meetingEndIcon: IconData = {
  selector: ".google-symbols",
  text: "call_end"
};

const captionsIcon: IconData = {
  selector: ".google-symbols",
  text: "closed_caption_off"
};

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

function selectElements(selector: string, text?: string): HTMLElement[] {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!text) {
    return Array.from(elements);
  }

  const regex = new RegExp(text);
  return Array.from(elements).filter(element => regex.test(element.textContent || ""));
}

let personNameBuffer = "",
  transcriptTextBuffer = "",
  timestampBuffer = "";

const reportErrorMessage = "There is a bug in TranscripTonic. Please report it.";
function transcriptMutationCallback(mutationsList: MutationRecord[]): void {
  mutationsList.forEach(() => {
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
          if (transcriptTextBuffer === "") {
            personNameBuffer = currentPersonName;
            timestampBuffer = new Date().toISOString();
            transcriptTextBuffer = currentTranscriptText;
          } else {
            if (personNameBuffer !== currentPersonName) {
              pushBufferToTranscript(); // Push old buffer
              personNameBuffer = currentPersonName;
              timestampBuffer = new Date().toISOString();
              transcriptTextBuffer = currentTranscriptText;
            } else {
              // Same person continues speaking
              if (canUseAriaBasedTranscriptSelector) {
                if (currentTranscriptText.length - transcriptTextBuffer.length < -250) {
                  pushBufferToTranscript(); // Edge case: long segment reset
                }
              }

              transcriptTextBuffer = currentTranscriptText;

              if (!canUseAriaBasedTranscriptSelector && currentTranscriptText.length > 250) {
                person.remove(); // Force restart of transcript node
              }
            }
          }
        }
      } else {
        console.log("No active transcript");
        if (personNameBuffer && transcriptTextBuffer) {
          pushBufferToTranscript();
        }
        personNameBuffer = "";
        transcriptTextBuffer = "";
      }

      // Debug logs
      console.log(transcriptTextBuffer);
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
  if (!transcriptTextBuffer || !timestampBuffer) return;

  const name = personNameBuffer === "You" ? userName : personNameBuffer;

  transcript.push({
    personName: name,
    timestamp: timestampBuffer,
    text: transcriptTextBuffer
  });

  //overWriteChromeStorage(["transcript"], false);
}
