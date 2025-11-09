"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantMutationHandler = void 0;
class ParticipantMutationHandler {
    constructor(page, pushToHub) {
        this.page = page;
        this.pushToHub = pushToHub;
        this.knownParticipantIds = new Set();
    }
    async observe() {
        await this.initializeExistingParticipants();
        await this.page.exposeFunction("onParticipantDetected", async (participants) => {
            this.processNewParticipants(participants);
        });
        await this.page.evaluate((selector) => {
            const extractParticipants = () => {
                const participantElements = document.querySelectorAll(selector);
                const participants = [];
                participantElements.forEach((element) => {
                    const participantId = element.getAttribute("data-participant-id");
                    if (!participantId)
                        return;
                    const nameElement = element.querySelector("span.notranslate");
                    const fullName = nameElement?.textContent?.trim() || "Unknown Participant";
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
                                    window.onParticipantDetected(participants);
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
    async initializeExistingParticipants() {
        const existingParticipants = await this.extractParticipantsFromPage();
        this.processNewParticipants(existingParticipants);
    }
    async extractParticipantsFromPage() {
        return await this.page.evaluate((selector) => {
            const participantElements = document.querySelectorAll(selector);
            const participants = [];
            participantElements.forEach((element) => {
                const participantId = element.getAttribute("data-participant-id");
                if (!participantId)
                    return;
                const nameElement = element.querySelector("span.notranslate");
                const fullName = nameElement?.textContent?.trim() || "Unknown Participant";
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
    processNewParticipants(participants) {
        const newParticipants = participants.filter((participant) => {
            if (!this.knownParticipantIds.has(participant.id)) {
                this.knownParticipantIds.add(participant.id);
                return true;
            }
            return false;
        });
        if (newParticipants.length > 0) {
            this.pushToHub(newParticipants.map((p) => ({
                id: "",
                fullName: p.fullName,
                pictureUrl: p.pictureUrl,
            })));
        }
    }
}
exports.ParticipantMutationHandler = ParticipantMutationHandler;
ParticipantMutationHandler.PARTICIPANT_SELECTOR = "div[data-participant-id]";
