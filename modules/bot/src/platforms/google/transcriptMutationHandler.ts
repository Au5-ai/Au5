import { TranscriptionEntryMessage } from "../../types";
import { Page } from "playwright-core";
import { Caption, GoogleCaptionConfiguration, MutationContext } from "./types";
import { DomUtility } from "./domUtility";
import { logger } from "../../utils/logger";
import { LiveCaptionsHelper } from "./liveCaptionsHelper";

export class TranscriptMutationHandler {
  private domUtility: DomUtility;
  private previousTranscripts: Record<string, string> = {};

  constructor(private page: Page, private config: GoogleCaptionConfiguration) {
    this.domUtility = new DomUtility(page);
  }

  async initialize(callback: (message: TranscriptionEntryMessage) => void) {
    await this.activateCaptions();
    let ctx = await this.findTranscriptContainer();
    await this.observeTranscriptContainer(ctx, callback);
  }

  private async activateCaptions(): Promise<void> {
    logger.info(
      `[GoogleMeet][Transcription] Activating live captions for language: ${this.config.language}`
    );
    await new LiveCaptionsHelper(this.page).enableCaptions(
      this.config.language
    );
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

    await this.page.exposeFunction(
      "handleTranscription",
      async (caption: Caption) => {
        if (!caption.transcript || !caption.transcript.trim()) return;
        if (this.previousTranscripts[caption.blockId] === caption.transcript)
          return;
        this.previousTranscripts[caption.blockId] = caption.transcript;

        callback({
          transcriptBlockId: caption.blockId,
          speaker: {
            fullName: caption.speakerName,
            pictureUrl: caption.pictureUrl,
          },
          transcript: caption.transcript,
          timestamp: new Date(),
          meetingId: "",
          type: "TranscriptionEntry",
        } as TranscriptionEntryMessage);
      }
    );

    // Step 2: Attach MutationObserver in browser context
    await this.page.evaluate((element) => {
      const isCaptionBlock = (
        container: HTMLElement | null,
        el: Element
      ): boolean => {
        return el.parentElement === container;
      };

      const findCaptionBlock = (
        container: HTMLElement | null,
        node: Node
      ): Element | null => {
        let current: Element | null =
          node.nodeType === Node.ELEMENT_NODE
            ? (node as Element)
            : node.parentElement;

        while (current && current.parentElement !== container) {
          current = current.parentElement;
        }

        return current?.parentElement === container ? current : null;
      };

      const extractCaptionData = (
        block: Element
      ): {
        blockId: string;
        speakerName: string;
        pictureUrl: string;
        transcript: string;
      } => {
        const blockId = block.getAttribute("data-blockid")!;
        const img = block.querySelector("img");
        const nameSpan = block.querySelector("span");
        const textDiv = Array.from(block.querySelectorAll("div")).find(
          (d) => d.childElementCount === 0 && d.textContent?.trim()
        );

        return {
          blockId,
          speakerName: nameSpan?.textContent?.trim() ?? "",
          pictureUrl: img?.getAttribute("src") ?? "",
          transcript: textDiv?.textContent?.trim() ?? "",
        };
      };

      const processBlock = (
        el: Element
      ): {
        blockId: string;
        speakerName: string;
        pictureUrl: string;
        transcript: string;
      } => {
        if (!el.hasAttribute("data-blockid")) {
          el.setAttribute("data-blockid", crypto.randomUUID());
        }
        return extractCaptionData(el);
      };

      const observer = new MutationObserver((mutations) => {
        let blockTranscription: Caption = {
          blockId: "",
          speakerName: "",
          pictureUrl: "",
          transcript: "",
        };

        for (const mutation of mutations) {
          // Handle added blocks
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              if (isCaptionBlock(element, el)) {
                const captionBlock = processBlock(el);
                if (captionBlock.transcript.trim() !== "") {
                  blockTranscription = captionBlock;
                }
              }
            }
          }

          // Handle updated blocks
          const block = findCaptionBlock(element, mutation.target);
          if (block) {
            blockTranscription = processBlock(block);
          }

          if (blockTranscription.transcript.trim() == "") {
            return;
          }

          // @ts-ignore
          window.handleTranscription(blockTranscription);
        }
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
}

// // Configuration for speaker detection
// const participantSelector = 'div[data-participant-id]'; // UPDATED: More specific selector
// const speakingClasses = ['Oaajhc', 'HX2H7', 'wEsLMd', 'OgVli']; // Speaking/animation classes
// const silenceClass = 'gjg47c';        // Class indicating the participant is silent
// const nameSelectors = [               // Try these selectors to find participant's name
//     '[data-participant-id]'           // Attribute for participant ID
// ];

// // State for tracking speaking status
// const speakingStates = new Map(); // Stores the logical speaking state for each participant ID
// const activeParticipants = new Map(); // NEW: Central map for all known participants

// function getParticipantName(participantElement: HTMLElement) {
//     const mainTile = participantElement.closest('[data-participant-id]') as HTMLElement;
//     if (mainTile) {
//         const userExampleNameElement = mainTile.querySelector('span.notranslate');
//         if (userExampleNameElement && userExampleNameElement.textContent && userExampleNameElement.textContent.trim()) {
//             const nameText = userExampleNameElement.textContent.trim();
//             if (nameText.length > 1 && nameText.length < 50 && /^[\p{L}\s.'-]+$/u.test(nameText)) {
//                 const forbiddenSubstrings = ["more_vert", "mic_off", "mic", "videocam", "videocam_off", "present_to_all", "devices", "speaker", "speakers", "microphone"];
//                 if (!forbiddenSubstrings.some(sub => nameText.toLowerCase().includes(sub.toLowerCase()))) {
//                     return nameText;
//                 }
//             }
//         }
//         const googleTsNameSelectors = [
//             '[data-self-name]', '.zWGUib', '.cS7aqe.N2K3jd', '.XWGOtd', '[data-tooltip*="name"]'
//         ];
//         for (const selector of googleTsNameSelectors) {
//             const nameElement = mainTile.querySelector(selector) as HTMLElement;
//             if (nameElement) {
//                 let nameText = (nameElement as HTMLElement).textContent ||
//                               (nameElement as HTMLElement).innerText ||
//                               nameElement.getAttribute('data-self-name') ||
//                               nameElement.getAttribute('data-tooltip');
//                 if (nameText && nameText.trim()) {
//                     if (selector.includes('data-tooltip') && nameText.includes("Tooltip for ")) {
//                         nameText = nameText.replace("Tooltip for ", "").trim();
//                     }
//                     if (nameText && nameText.trim()) {
//                         const forbiddenSubstrings = ["more_vert", "mic_off", "mic", "videocam", "videocam_off", "present_to_all", "devices", "speaker", "speakers", "microphone"];
//                         if (!forbiddenSubstrings.some(sub => nameText!.toLowerCase().includes(sub.toLowerCase()))) {
//                             const trimmedName = nameText!.split('\n').pop()?.trim();
//                             return trimmedName || 'Unknown (Filtered)';
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     for (const selector of nameSelectors) {
//         const nameElement = participantElement.querySelector(selector) as HTMLElement;
//         if (nameElement) {
//             let nameText = (nameElement as HTMLElement).textContent ||
//                           (nameElement as HTMLElement).innerText ||
//                           nameElement.getAttribute('data-self-name');
//             if (nameText && nameText.trim()) {
//                 // ADDED: Apply forbidden substrings and trimming logic here too
//                 const forbiddenSubstrings = ["more_vert", "mic_off", "mic", "videocam", "videocam_off", "present_to_all", "devices", "speaker", "speakers", "microphone"];
//                 if (!forbiddenSubstrings.some(sub => nameText!.toLowerCase().includes(sub.toLowerCase()))) {
//                     const trimmedName = nameText!.split('\n').pop()?.trim();
//                     if (trimmedName && trimmedName.length > 1 && trimmedName.length < 50 && /^[\p{L}\s.'-]+$/u.test(trimmedName)) { // Added basic length and char validation
//                        return trimmedName;
//                     }
//                 }
//                 // If it was forbidden or failed validation, it won't return, allowing loop to continue or fallback.
//             }
//         }
//     }
//     if (participantElement.textContent && participantElement.textContent.includes("You") && participantElement.textContent.length < 20) {
//         return "You";
//     }
//     const idToDisplay = mainTile ? getParticipantId(mainTile) : getParticipantId(participantElement);
//     return `Participant (${idToDisplay})`;
// }

// function observeParticipant(participantElement: HTMLElement) {
//     const participantId = getParticipantId(participantElement);

//     // Determine initial logical state based on current classes
//     speakingStates.set(participantId, "silent"); // Initialize participant as silent. logSpeakerEvent will handle transitions.

//     let classListForInitialScan = participantElement.classList; // Default to the main participant element's classes
//     // Check if any descendant has a speaking class
//     for (const cls of speakingClasses) {
//         const descendantElement = participantElement.querySelector('.' + cls); // Corrected selector
//         if (descendantElement) {
//             classListForInitialScan = descendantElement.classList;
//             break;
//         }
//     }
//     // If no speaking descendant was found, classListForInitialScan remains participantElement.classList.
//     // This is correct for checking if participantElement itself has a speaking or silence class.

//     (window as any).logBot(`👁️ Observing: ${getParticipantName(participantElement)} (ID: ${participantId}). Performing initial participant state analysis.`);
//     // Call logSpeakerEvent with the determined classList.
//     // It will compare against the "silent" state and emit SPEAKER_START if currently speaking,
//     // or do nothing if currently silent (matching the initialized state).
//     logSpeakerEvent(participantElement, classListForInitialScan);

//     // NEW: Add participant to our central map
//     activeParticipants.set(participantId, { name: getParticipantName(participantElement), element: participantElement });

//     const callback = function(mutationsList: MutationRecord[], observer: MutationObserver) {
//         for (const mutation of mutationsList) {
//             if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
//                 const targetElement = mutation.target as HTMLElement;
//                 if (targetElement.matches(participantSelector) || participantElement.contains(targetElement)) {
//                     const finalTarget = targetElement.matches(participantSelector) ? targetElement : participantElement;
//                     // logSpeakerEvent(finalTarget, finalTarget.classList); // Old line
//                     logSpeakerEvent(finalTarget, targetElement.classList); // Corrected line
//                 }
//             }
//         }
//     };

//     const observer = new MutationObserver(callback);
//     observer.observe(participantElement, {
//         attributes: true,
//         attributeFilter: ['class'],
//         subtree: true
//     });

//     if (!(participantElement as any).dataset.vexaObserverAttached) {
//          (participantElement as any).dataset.vexaObserverAttached = 'true';
//     }
// }

// // Monitor for new participants
// const bodyObserver = new MutationObserver((mutationsList) => {
//     for (const mutation of mutationsList) {
//         if (mutation.type === 'childList') {
//             mutation.addedNodes.forEach(node => {
//                 if (node.nodeType === Node.ELEMENT_NODE) {
//                     const elementNode = node as HTMLElement;
//                     if (elementNode.matches(participantSelector) && !(elementNode as any).dataset.vexaObserverAttached) {
//                         observeParticipant(elementNode);
//                     }
//                     const childElements = elementNode.querySelectorAll(participantSelector);
//                     for (let i = 0; i < childElements.length; i++) {
//                         const childEl = childElements[i] as HTMLElement;
//                         if (!(childEl as any).dataset.vexaObserverAttached) {
//                             observeParticipant(childEl);
//                         }
//                     }
//                 }
//             });
//             mutation.removedNodes.forEach(node => {
//                  if (node.nodeType === Node.ELEMENT_NODE) {
//                     const elementNode = node as HTMLElement;
//                     if (elementNode.matches(participantSelector)) {
//                        const participantId = getParticipantId(elementNode);
//                        const participantName = getParticipantName(elementNode);
//                        if (speakingStates.get(participantId) === 'speaking') {
//                             // Send synthetic SPEAKER_END if they were speaking when removed
//                             (window as any).logBot(`🔇 SPEAKER_END (Participant removed while speaking): ${participantName} (ID: ${participantId})`);
//                             sendSpeakerEvent("SPEAKER_END", elementNode);
//                        }
//                        speakingStates.delete(participantId);
//                        delete (elementNode as any).dataset.vexaObserverAttached;
//                        delete (elementNode as any).dataset.vexaGeneratedId;
//                        (window as any).logBot(`🗑️ Removed observer for: ${participantName} (ID: ${participantId})`);

//                        // NEW: Remove participant from our central map
//                        activeParticipants.delete(participantId);
//                     }
//                  }
//             });
//         }
//     }
// });

// bodyObserver.observe(document.body, {
//     childList: true,
//     subtree: true
// });
