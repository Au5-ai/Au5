import { Page } from "playwright-core";
import { Participant } from "../../types";

export class ParticipantMutationHandler {
  private knownParticipantIds = new Set<string>();
  private static readonly PARTICIPANT_SELECTOR = "div[data-participant-id]";

  constructor(
    private page: Page,
    private pushToHub: (participant: Participant[]) => void
  ) {}

  async observe(): Promise<void> {
    await this.initializeExistingParticipants();

    await this.page.exposeFunction(
      "onParticipantDetected",
      async (participant: Participant) => {
        if (!this.knownParticipantIds.has(participant.id)) {
          this.knownParticipantIds.add(participant.id);
          this.pushToHub([participant]);
        }
      }
    );

    await this.page.evaluate((selector) => {
      const knownIds = new Set<string>();

      const extractParticipantData = (element: HTMLElement): any | null => {
        const participantId = element.getAttribute("data-participant-id");
        if (!participantId) return null;

        const nameElement = element.querySelector("span.notranslate");
        const fullName =
          nameElement?.textContent?.trim() || "Unknown Participant";

        const imgElement = element.querySelector("img");
        const pictureUrl = imgElement?.src || "";

        return {
          id: participantId,
          fullName,
          pictureUrl,
        };
      };

      const processParticipant = (element: HTMLElement) => {
        const participantData = extractParticipantData(element);
        if (participantData && !knownIds.has(participantData.id)) {
          knownIds.add(participantData.id);
          (window as any).onParticipantDetected(participantData);
        }
      };

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const participantDivs = node.querySelectorAll(selector);
              console.log("Detected participant divs:", participantDivs);
              participantDivs.forEach((div) => {
                if (div instanceof HTMLElement) {
                  processParticipant(div);
                }
              });
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }, ParticipantMutationHandler.PARTICIPANT_SELECTOR);
  }

  private async initializeExistingParticipants(): Promise<void> {
    const existingParticipants = await this.page.evaluate((selector) => {
      const participantElements = document.querySelectorAll(selector);
      const participants: any[] = [];

      participantElements.forEach((element) => {
        const participantId = element.getAttribute("data-participant-id");
        if (!participantId) return;

        const nameElement = element.querySelector("span.notranslate");
        const fullName =
          nameElement?.textContent?.trim() || "Unknown Participant";

        const imgElement = element.querySelector("img");
        const pictureUrl = imgElement?.src || "";

        participants.push({
          id: participantId,
          fullName,
          pictureUrl,
        });
      });

      return participants;
    }, ParticipantMutationHandler.PARTICIPANT_SELECTOR);

    const participantsToBePushed: Participant[] = existingParticipants.filter(
      (participant: Participant) => {
        if (!this.knownParticipantIds.has(participant.id)) {
          this.knownParticipantIds.add(participant.id);
          return true;
        }
        return false;
      }
    );

    if (participantsToBePushed.length > 0) {
      this.pushToHub(participantsToBePushed);
    }
  }
}
