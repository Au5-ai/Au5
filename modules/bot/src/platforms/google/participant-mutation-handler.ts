import { Page } from "playwright-core";
import { Participant } from "../../types";
import { logger } from "../../common/utils/logger";

export class ParticipantMutationHandler {
  private knownParticipantIds = new Set<string>();

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

    await this.page.evaluate(() => {
      const selector = "div[data-participant-id]";
      const knownIds = new Set<string>();

      const extractParticipantData = async (
        element: HTMLElement
      ): Promise<any | null> => {
        await new Promise((resolve) => setTimeout(resolve, 3000));

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

      const processParticipant = async (element: HTMLElement) => {
        const participantData = await extractParticipantData(element);
        if (participantData && !knownIds.has(participantData.id)) {
          knownIds.add(participantData.id);
          (window as any).onParticipantDetected(participantData);
        }
      };

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (node.matches(selector)) {
                processParticipant(node);
              }

              const participantDivs = node.querySelectorAll(selector);
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
    });
  }

  private async initializeExistingParticipants(): Promise<void> {
    const existingParticipants = await this.page.evaluate(() => {
      const selector = "div[data-participant-id]";
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
    });

    const participantsMusebePushed: Participant[] = [];

    existingParticipants.forEach((participant: Participant) => {
      if (!this.knownParticipantIds.has(participant.id)) {
        this.knownParticipantIds.add(participant.id);
        participantsMusebePushed.push(participant);
      }
    });

    if (participantsMusebePushed.length > 0) {
      this.pushToHub(participantsMusebePushed);
    }
  }
}
