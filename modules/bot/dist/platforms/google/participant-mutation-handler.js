"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantMutationHandler = void 0;
const logger_1 = require("../../common/utils/logger");
class ParticipantMutationHandler {
    constructor(page) {
        this.page = page;
        this.knownParticipantIds = new Set();
    }
    async observe(pushToHub) {
        await this.initializeExistingParticipants(pushToHub);
        await this.page.exposeFunction("onParticipantDetected", async (participant) => {
            if (!this.knownParticipantIds.has(participant.id)) {
                this.knownParticipantIds.add(participant.id);
                logger_1.logger.info(`New participant detected: ${participant.fullName} (${participant.id})`);
                pushToHub(participant);
            }
        });
        await this.page.evaluate(() => {
            const selector = "div[data-participant-id]";
            const knownIds = new Set();
            const extractParticipantData = (element) => {
                const participantId = element.getAttribute("data-participant-id");
                if (!participantId)
                    return null;
                const nameElement = element.querySelector("span.notranslate");
                const fullName = nameElement?.textContent?.trim() || "Unknown Participant";
                const imgElement = element.querySelector("img");
                const pictureUrl = imgElement?.src || "";
                return {
                    id: participantId,
                    fullName,
                    pictureUrl,
                };
            };
            const processParticipant = (element) => {
                const participantData = extractParticipantData(element);
                if (participantData && !knownIds.has(participantData.id)) {
                    knownIds.add(participantData.id);
                    window.onParticipantDetected(participantData);
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
            console.log(`Started observing mutations for selector: ${selector}`);
        });
    }
    async initializeExistingParticipants(pushToHub) {
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
                });
            });
            return participants;
        });
        existingParticipants.forEach((participant) => {
            if (!this.knownParticipantIds.has(participant.id)) {
                this.knownParticipantIds.add(participant.id);
                logger_1.logger.info(`Existing participant found: ${participant.fullName} (${participant.id})`);
                pushToHub(participant);
            }
        });
        logger_1.logger.info(`Initialized with ${existingParticipants.length} existing participants`);
    }
}
exports.ParticipantMutationHandler = ParticipantMutationHandler;
