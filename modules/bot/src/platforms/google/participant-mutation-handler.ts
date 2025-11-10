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
      async (participants: Participant[]) => {
        this.processNewParticipants(participants);
      }
    );

    await this.page.evaluate((selector) => {
      const extractParticipants = () => {
        const participantElements = document.querySelectorAll(selector);
        const participants: Participant[] = [];

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
      };

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              setTimeout(() => {
                const participants = extractParticipants();
                if (participants.length > 0) {
                  (window as any).onParticipantDetected(participants);
                }
              }, 3000);
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
    const existingParticipants = await this.extractParticipantsFromPage();
    this.processNewParticipants(existingParticipants);
  }

  private async extractParticipantsFromPage(): Promise<Participant[]> {
    return await this.page.evaluate((selector) => {
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
  }

  private processNewParticipants(participants: Participant[]): void {
    const newParticipants = participants.filter((participant) => {
      if (!this.knownParticipantIds.has(participant.id)) {
        this.knownParticipantIds.add(participant.id);
        return true;
      }
      return false;
    });

    if (newParticipants.length > 0) {
      this.pushToHub(
        newParticipants.map((p) => ({
          id: "",
          fullName: p.fullName,
          pictureUrl: p.pictureUrl,
        }))
      );
    }
  }
}
