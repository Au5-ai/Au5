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
        await this.page.exposeFunction("onParticipantDetected", async (participant) => {
            if (!this.knownParticipantIds.has(participant.id)) {
                this.knownParticipantIds.add(participant.id);
                this.pushToHub([participant]);
            }
        });
        await this.page.evaluate(() => {
            const selector = "div[data-participant-id]";
            const knownIds = new Set();
            const extractParticipantData = async (element) => {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                const participantId = element.getAttribute("data-participant-id");
                if (!participantId)
                    return null;
                const nameElement = element.querySelector("span.notranslate");
                const fullName = nameElement?.textContent?.trim() || "Unknown Participant";
                const imgElement = element.querySelector("img");
                const pictureUrl = imgElement?.src || "";
                return {
                    fullName,
                    pictureUrl,
                };
            };
            const processParticipant = async (element) => {
                const participantData = await extractParticipantData(element);
                if (participantData && !knownIds.has(participantData.id)) {
                    knownIds.add(participantData.id);
                    window.onParticipantDetected(participantData);
                }
            };
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLElement) {
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
    async initializeExistingParticipants() {
        const existingParticipants = await this.page.evaluate(() => {
            const selector = "div[data-participant-id]";
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
                    email: "",
                });
            });
            return participants;
        });
        const participantsMusebePushed = [];
        existingParticipants.forEach((participant) => {
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
exports.ParticipantMutationHandler = ParticipantMutationHandler;
