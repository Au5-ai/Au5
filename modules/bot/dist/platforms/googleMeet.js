"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMeet = void 0;
const logger_1 = require("../utils/logger");
const utils_1 = require("../utils");
class GoogleMeet {
    constructor(config, page) {
        this.config = config;
        this.page = page;
        this.selectors = {
            leaveButton: `//button[@aria-label="Leave call"]`,
            enterNameField: 'input[type="text"][aria-label="Your name"]',
            joinButton: '//button[.//span[text()="Ask to join"]]',
            muteButton: '[aria-label*="Turn off microphone"]',
            cameraOffButton: '[aria-label*="Turn off camera"]',
        };
    }
    async join() {
        const { meetingUrl, botDisplayName } = this.config;
        if (!meetingUrl) {
            logger_1.logger.error("[GoogleMeet][Join] Meeting URL is missing in the configuration.");
            return false;
        }
        try {
            await this.navigateAndPrepare(meetingUrl, botDisplayName);
            const isAdmitted = await this.waitForMeetingAdmission();
            if (!isAdmitted) {
                logger_1.logger.warn(`[GoogleMeet][Join] Bot "${botDisplayName}" was not admitted to the meeting.`);
                return false;
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error(`[GoogleMeet][Join] Failed to join meeting: ${error.message}`);
        }
        return false;
    }
    async leave() {
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
    async waitForMeetingAdmission() {
        try {
            await this.page.waitForSelector(this.selectors.leaveButton, {
                timeout: this.config.autoLeave.waitingEnter,
            });
            return true;
        }
        catch {
            logger_1.logger.warn("[GoogleMeet][Admission] Bot was not admitted within the timeout period.");
            return false;
        }
    }
    async navigateAndPrepare(meetingUrl, botName) {
        await this.page.goto(meetingUrl, { waitUntil: "networkidle" });
        await this.page.bringToFront();
        await this.page.waitForTimeout(5000 + (0, utils_1.randomDelay)(1000));
        await this.page.waitForSelector(this.selectors.enterNameField, {
            timeout: 120000,
        });
        await this.page.fill(this.selectors.enterNameField, botName);
        await this.muteMic();
        await this.turnOffCamera();
        await this.page.waitForSelector(this.selectors.joinButton, {
            timeout: 60000,
        });
        await this.page.click(this.selectors.joinButton);
    }
    async muteMic() {
        try {
            await this.page.waitForTimeout((0, utils_1.randomDelay)(500));
            await this.page.click(this.selectors.muteButton, { timeout: 200 });
        }
        catch {
            logger_1.logger.warn("[GoogleMeet][Prepare] Microphone was already muted or mute button not found.");
        }
    }
    async turnOffCamera() {
        try {
            await this.page.waitForTimeout((0, utils_1.randomDelay)(500));
            await this.page.click(this.selectors.cameraOffButton, { timeout: 200 });
        }
        catch {
            logger_1.logger.warn("[GoogleMeet][Prepare] Camera was already off or button not found.");
        }
    }
}
exports.GoogleMeet = GoogleMeet;
