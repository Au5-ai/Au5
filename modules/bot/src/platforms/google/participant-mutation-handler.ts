import { Page } from "playwright-core";
import { Participant } from "../../types";
import { logger } from "../../common/utils/logger";

export class ParticipantMutationHandler {
  private isObserving = false;

  constructor(private page: Page) {}

  async observe(pushToHub: (participant: Participant) => void): Promise<void> {
    if (this.isObserving) {
      logger.warn("[GoogleMeet][Participants] Already observing participants");
      return;
    }

    this.isObserving = true;

    try {
      await this.page.exposeFunction(
        "__participantCallback",
        (data: { type: string; participant: Participant }) => {
          if (data.type === "PARTICIPANT_JOINED") {
            logger.info(
              `[GoogleMeet][Participants] Participant joined: ${data.participant.fullName}`
            );
            pushToHub(data.participant);
          } else if (data.type === "PARTICIPANT_LEFT") {
            logger.info(
              `[GoogleMeet][Participants] Participant left: ${data.participant.fullName}`
            );
          }
        }
      );

      await this.page.evaluate(this.injectParticipantObserver.bind(this));
      logger.info("[GoogleMeet][Participants] Started participant observation");
    } catch (error) {
      logger.error(
        `[GoogleMeet][Participants] Failed to start observation: ${error}`
      );
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isObserving) {
      return;
    }

    try {
      await this.page.evaluate(() => {
        const cleanupFn = (window as any).cleanupParticipantObserver;
        if (typeof cleanupFn === "function") {
          cleanupFn();
        }
      });

      this.isObserving = false;

      logger.info("[GoogleMeet][Participants] Stopped participant observation");
    } catch (error) {
      logger.error(
        `[GoogleMeet][Participants] Failed to stop observation: ${error}`
      );
    }
  }

  private injectParticipantObserver() {
    const PARTICIPANT_SELECTOR = "div[data-participant-id]";
    const SPEAKING_CLASSES = ["Oaajhc", "HX2H7", "wEsLMd", "OgVli"];
    const SILENCE_CLASS = "gjg47c";

    const FORBIDDEN_NAME_SUBSTRINGS = [
      "more_vert",
      "mic_off",
      "mic",
      "videocam",
      "videocam_off",
      "present_to_all",
      "devices",
      "speaker",
      "speakers",
      "microphone",
    ];

    const GOOGLE_NAME_SELECTORS = [
      "[data-self-name]",
      ".zWGUib",
      ".cS7aqe.N2K3jd",
      ".XWGOtd",
      '[data-tooltip*="name"]',
    ];

    const participantStates = new Map();
    const observers = new Map();
    let participantIdCounter = 0;

    function getParticipantId(element: HTMLElement): string {
      const dataId = element.getAttribute("data-participant-id");
      if (dataId) {
        return dataId;
      }

      const generatedId =
        element.getAttribute("data-au5-generated-id") ||
        `generated-${participantIdCounter++}`;
      element.setAttribute("data-au5-generated-id", generatedId);
      return generatedId;
    }

    function isNameValid(name: string): boolean {
      if (!name || name.length < 2 || name.length > 50) {
        return false;
      }

      if (!/^[\p{L}\s.'-]+$/u.test(name)) {
        return false;
      }

      const lowerName = name.toLowerCase();
      return !FORBIDDEN_NAME_SUBSTRINGS.some((forbidden) =>
        lowerName.includes(forbidden.toLowerCase())
      );
    }

    function extractParticipantName(
      participantElement: HTMLElement
    ): string | null {
      const mainTile = participantElement.closest(
        "[data-participant-id]"
      ) as HTMLElement;

      if (!mainTile) {
        return null;
      }

      const notranslateElement = mainTile.querySelector("span.notranslate");
      if (
        notranslateElement &&
        notranslateElement.textContent &&
        notranslateElement.textContent.trim()
      ) {
        const nameText = notranslateElement.textContent.trim();
        if (isNameValid(nameText)) {
          return nameText;
        }
      }

      for (const selector of GOOGLE_NAME_SELECTORS) {
        const nameElement = mainTile.querySelector(selector) as HTMLElement;
        if (nameElement) {
          let nameText =
            nameElement.textContent ||
            nameElement.innerText ||
            nameElement.getAttribute("data-self-name") ||
            nameElement.getAttribute("data-tooltip");

          if (nameText && nameText.trim()) {
            if (
              selector.includes("data-tooltip") &&
              nameText.includes("Tooltip for ")
            ) {
              nameText = nameText.replace("Tooltip for ", "").trim();
            }

            const trimmedName = nameText.split("\n").pop()?.trim();
            if (trimmedName && isNameValid(trimmedName)) {
              return trimmedName;
            }
          }
        }
      }

      if (
        participantElement.textContent &&
        participantElement.textContent.includes("You") &&
        participantElement.textContent.length < 20
      ) {
        return "You";
      }

      return null;
    }

    function extractParticipantPicture(
      participantElement: HTMLElement
    ): string {
      const mainTile = participantElement.closest(
        "[data-participant-id]"
      ) as HTMLElement;

      if (mainTile) {
        const imgElement = mainTile.querySelector("img");
        if (imgElement && imgElement.src) {
          return imgElement.src;
        }
      }

      return "";
    }

    function notifyParticipantChange(
      participantId: string,
      name: string,
      pictureUrl: string
    ) {
      const existingState = participantStates.get(participantId);

      if (!existingState) {
        participantStates.set(participantId, {
          id: participantId,
          name,
          pictureUrl,
          isSpeaking: false,
        });

        (window as any).logBot?.(
          `[ParticipantObserver] New participant joined: ${name} (ID: ${participantId})`
        );

        (window as any).__participantCallback?.({
          type: "PARTICIPANT_JOINED",
          participant: {
            id: participantId,
            fullName: name,
            pictureUrl,
          },
        });
      } else if (
        existingState.name !== name ||
        existingState.pictureUrl !== pictureUrl
      ) {
        participantStates.set(participantId, {
          ...existingState,
          name,
          pictureUrl,
        });

        (window as any).logBot?.(
          `[ParticipantObserver] Participant updated: ${name} (ID: ${participantId})`
        );
      }
    }

    function checkSpeakingState(
      participantId: string,
      element: HTMLElement
    ): void {
      const state = participantStates.get(participantId);
      if (!state) return;

      const hasSpeakingClass = SPEAKING_CLASSES.some((cls) => {
        return (
          element.classList.contains(cls) ||
          element.querySelector(`.${cls}`) !== null
        );
      });

      const hasSilenceClass =
        element.classList.contains(SILENCE_CLASS) ||
        element.querySelector(`.${SILENCE_CLASS}`) !== null;

      const isSpeaking = hasSpeakingClass && !hasSilenceClass;

      if (isSpeaking !== state.isSpeaking) {
        state.isSpeaking = isSpeaking;
        participantStates.set(participantId, state);

        const eventType = isSpeaking ? "SPEAKER_START" : "SPEAKER_END";
        (window as any).logBot?.(
          `[ParticipantObserver] ${eventType}: ${state.name} (ID: ${participantId})`
        );
      }
    }

    function observeParticipant(participantElement: HTMLElement): void {
      const participantId = getParticipantId(participantElement);

      if (observers.has(participantId)) {
        return;
      }

      const name = extractParticipantName(participantElement);
      if (!name) {
        return;
      }

      const pictureUrl = extractParticipantPicture(participantElement);

      notifyParticipantChange(participantId, name, pictureUrl);
      checkSpeakingState(participantId, participantElement);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            const targetElement = mutation.target as HTMLElement;
            if (
              targetElement.matches(PARTICIPANT_SELECTOR) ||
              participantElement.contains(targetElement)
            ) {
              checkSpeakingState(participantId, participantElement);
            }
          }
        }
      });

      observer.observe(participantElement, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: true,
      });

      observers.set(participantId, observer);
      participantElement.setAttribute("data-au5-observer-attached", "true");
    }

    function removeParticipant(participantElement: HTMLElement): void {
      const participantId = getParticipantId(participantElement);
      const state = participantStates.get(participantId);

      if (state) {
        (window as any).logBot?.(
          `[ParticipantObserver] Participant left: ${state.name} (ID: ${participantId})`
        );

        (window as any).__participantCallback?.({
          type: "PARTICIPANT_LEFT",
          participant: {
            id: participantId,
            fullName: state.name,
            pictureUrl: state.pictureUrl,
          },
        });

        participantStates.delete(participantId);
      }

      const observer = observers.get(participantId);
      if (observer) {
        observer.disconnect();
        observers.delete(participantId);
      }

      participantElement.removeAttribute("data-au5-observer-attached");
      participantElement.removeAttribute("data-au5-generated-id");
    }

    function scanExistingParticipants(): void {
      const existingParticipants =
        document.querySelectorAll(PARTICIPANT_SELECTOR);
      (window as any).logBot?.(
        `[ParticipantObserver] Scanning ${existingParticipants.length} existing participants`
      );

      existingParticipants.forEach((element) => {
        const participantElement = element as HTMLElement;
        if (!participantElement.getAttribute("data-au5-observer-attached")) {
          observeParticipant(participantElement);
        }
      });
    }

    const bodyObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;

              if (
                element.matches(PARTICIPANT_SELECTOR) &&
                !element.getAttribute("data-au5-observer-attached")
              ) {
                observeParticipant(element);
              }

              const children = element.querySelectorAll(PARTICIPANT_SELECTOR);
              children.forEach((child) => {
                const childElement = child as HTMLElement;
                if (!childElement.getAttribute("data-au5-observer-attached")) {
                  observeParticipant(childElement);
                }
              });
            }
          });

          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;

              if (element.matches(PARTICIPANT_SELECTOR)) {
                removeParticipant(element);
              }

              const children = element.querySelectorAll(PARTICIPANT_SELECTOR);
              children.forEach((child) => {
                removeParticipant(child as HTMLElement);
              });
            }
          });
        }
      }
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    scanExistingParticipants();

    (window as any).cleanupParticipantObserver = () => {
      bodyObserver.disconnect();
      observers.forEach((observer: any) => observer.disconnect());
      observers.clear();
      participantStates.clear();
      (window as any).logBot?.(
        "[ParticipantObserver] Cleaned up all observers"
      );
    };

    (window as any).getParticipantStates = () => {
      return Array.from(participantStates.values());
    };

    (window as any).logBot?.(
      "[ParticipantObserver] Participant observation system initialized"
    );
  }

  async getActiveParticipants(): Promise<Participant[]> {
    try {
      const participants = await this.page.evaluate(() => {
        const getStateFn = (window as any).getParticipantStates;
        if (typeof getStateFn === "function") {
          const states = getStateFn();
          return states.map((state: any) => ({
            id: state.id,
            fullName: state.name,
            pictureUrl: state.pictureUrl,
          }));
        }
        return [];
      });

      return participants;
    } catch (error) {
      logger.error(
        `[GoogleMeet][Participants] Failed to get active participants: ${error}`
      );
      return [];
    }
  }
}
