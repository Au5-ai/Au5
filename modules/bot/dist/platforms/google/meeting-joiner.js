"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingJoiner = void 0;
const logger_1 = require("../../common/utils/logger");
const utils_1 = require("../../common/utils");
const constants_1 = require("./constants");
class MeetingJoiner {
    constructor(page, prepareDelayMs) {
        this.page = page;
        this.prepareDelayMs = prepareDelayMs;
        this.selectors = {
            leaveButton: `//button[@aria-label="Leave call"]`,
            peopleButton: `button[aria-label*="People"][data-panel-id="1"]`,
            enterNameField: 'input[type="text"][aria-label="Your name"]',
            joinButton: '//button[.//span[text()="Ask to join" or text()="Join now"]]',
            muteButton: '[aria-label*="Turn off microphone"]',
            cameraOffButton: '[aria-label*="Turn off camera"]',
        };
    }
    async join(meetingUrl, botName, admissionTimeout) {
        await this.navigateAndPrepare(meetingUrl, botName);
        return await this.waitForAdmission(admissionTimeout);
    }
    async navigateAndPrepare(meetingUrl, botName) {
        await this.page.goto(meetingUrl, { waitUntil: "networkidle" });
        await this.page.bringToFront();
        await this.page.waitForTimeout(this.prepareDelayMs + (0, utils_1.randomDelay)(constants_1.RANDOM_DELAY_MAX));
        await this.page.waitForSelector(this.selectors.enterNameField, {
            timeout: constants_1.WAIT_FOR_NAME_FIELD_TIMEOUT,
        });
        await this.page.fill(this.selectors.enterNameField, botName);
        await this.muteMic();
        await this.turnOffCamera();
        await this.page.waitForSelector(this.selectors.joinButton, {
            timeout: constants_1.WAIT_FOR_JOIN_BUTTON_TIMEOUT,
        });
        await this.page.click(this.selectors.joinButton);
    }
    async waitForAdmission(timeout) {
        try {
            logger_1.logger.info("[GoogleMeet][Admission] Waiting for bot to be admitted into the meeting...");
            await this.page.waitForSelector(this.selectors.peopleButton, {
                timeout,
            });
            logger_1.logger.info("[GoogleMeet][Admission] Bot successfully admitted - People button detected.");
            return true;
        }
        catch {
            logger_1.logger.warn("[GoogleMeet][Admission] Bot was not admitted within the timeout period.");
            return false;
        }
    }
    async muteMic() {
        try {
            await this.page.waitForTimeout((0, utils_1.randomDelay)(500));
            await this.page.click(this.selectors.muteButton, { timeout: 200 });
        }
        catch (error) {
            logger_1.logger.warn(`[GoogleMeet][Prepare] Microphone was already muted or mute button not found: ${error.message}`);
        }
    }
    async turnOffCamera() {
        try {
            await this.page.waitForTimeout((0, utils_1.randomDelay)(500));
            await this.page.click(this.selectors.cameraOffButton, { timeout: 200 });
        }
        catch (error) {
            logger_1.logger.warn(`[GoogleMeet][Prepare] Camera was already off or button not found: ${error.message}`);
        }
    }
}
exports.MeetingJoiner = MeetingJoiner;
