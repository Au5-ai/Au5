"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMeet = void 0;
const logger_1 = require("../../common/utils/logger");
const utils_1 = require("../../common/utils");
const caption_mutation_handler_1 = require("./caption-mutation-handler");
const constants_1 = require("./constants");
const caption_enabler_1 = require("./caption-enabler");
const meeting_joiner_1 = require("./meeting-joiner");
class GoogleMeet {
    constructor(config, page) {
        this.config = config;
        this.page = page;
    }
    async joinMeeting() {
        const { meetingUrl, botDisplayName } = this.config;
        if (!meetingUrl) {
            logger_1.logger.error("[GoogleMeet][Join] Meeting URL is missing in the configuration.");
            return false;
        }
        try {
            const prepareDelayMs = this.config.delayBeforeInteraction ?? 5000;
            const joiner = new meeting_joiner_1.MeetingJoiner(this.page, prepareDelayMs);
            const isAdmitted = await joiner.join(meetingUrl, botDisplayName, this.config.autoLeave.waitingEnter);
            if (!isAdmitted) {
                logger_1.logger.info(`[GoogleMeet][NotJoin] Bot "${botDisplayName}" was not admitted to the meeting.`);
                return false;
            }
            logger_1.logger.info(`[GoogleMeet][Join] Bot "${botDisplayName}" was admitted to the meeting.`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`[GoogleMeet][Join] Failed to join meeting: ${error.message}`);
            return false;
        }
    }
    async observeTranscriptions(pushToHubCallback) {
        if (this.config.meeting_settings.transcription &&
            this.config.meeting_settings.transcription_model === "liveCaption") {
            const captionConfig = {
                ...constants_1.GOOGLE_CAPTION_CONFIGURATION,
                language: this.config.language || "en-US",
            };
            await new caption_enabler_1.CaptionEnabler(this.page).activate(captionConfig.language);
            await (0, utils_1.delay)(constants_1.CAPTION_UI_STABILIZATION_DELAY);
            logger_1.logger.info("[GoogleMeet] Starting transcription observation...");
            await new caption_mutation_handler_1.CaptionMutationHandler(this.page, captionConfig).observe(pushToHubCallback);
        }
    }
    async observeParticipations(pushToHub) {
        logger_1.logger.warn("[GoogleMeet] Participation observation not yet implemented.");
    }
    async leaveMeeting() {
        if (!this.page || this.page.isClosed()) {
            logger_1.logger.warn("[GoogleMeet][Leave] Page context is unavailable or already closed.");
            return false;
        }
        try {
            const result = await this.page.evaluate(() => {
                const leaveFn = window.performLeaveAction;
                if (typeof leaveFn === "function") {
                    return leaveFn();
                }
                console.error("[GoogleMeet][Leave] performLeaveAction function not found on window.");
                return false;
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error(`[GoogleMeet][Leave] Failed to trigger leave action: ${error.message}`);
            return false;
        }
    }
}
exports.GoogleMeet = GoogleMeet;
