"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMeet = void 0;
const logger_1 = require("../utils/logger");
const utils_1 = require("../utils");
class GoogleMeet {
    constructor(config, page) {
        this.config = config;
        this.page = page;
        this.leaveButton = `//button[@aria-label="Leave call"]`;
        this.enterNameField = 'input[type="text"][aria-label="Your name"]';
        this.joinButton = '//button[.//span[text()="Ask to join"]]';
        this.muteButton = '[aria-label*="Turn off microphone"]';
        this.cameraOffButton = '[aria-label*="Turn off camera"]';
        this.waitForMeetingAdmission = async () => {
            try {
                await this.page.waitForSelector(this.leaveButton, {
                    timeout: this.config.autoLeave.waitingEnter,
                });
                return true;
            }
            catch {
                throw new Error("[GoogleMeet Error] Bot was not admitted into the meeting within the timeout period");
            }
        };
        this.joinMeeting = async (page, meetingUrl, botName) => {
            // const enterNameField = 'input[type="text"][aria-label="Your name"]';
            // const joinButton = '//button[.//span[text()="Ask to join"]]';
            // const muteButton = '[aria-label*="Turn off microphone"]';
            // const cameraOffButton = '[aria-label*="Turn off camera"]';
            await page.goto(meetingUrl, { waitUntil: "networkidle" });
            await page.bringToFront();
            await page.waitForTimeout(5000);
            await page.waitForTimeout((0, utils_1.randomDelay)(1000));
            await page.waitForSelector(this.enterNameField, {
                timeout: 120000,
            });
            await page.waitForTimeout((0, utils_1.randomDelay)(1000));
            await page.fill(this.enterNameField, botName);
            try {
                await page.waitForTimeout((0, utils_1.randomDelay)(500));
                await page.click(this.muteButton, { timeout: 200 });
                await page.waitForTimeout(200);
            }
            catch (e) {
                logger_1.logger.info("Microphone already muted or not found.");
            }
            try {
                await page.waitForTimeout((0, utils_1.randomDelay)(500));
                await page.click(this.cameraOffButton, {
                    timeout: 200,
                });
                await page.waitForTimeout(200);
            }
            catch (e) {
                logger_1.logger.info("Camera already off or not found.");
            }
            await page.waitForSelector(this.joinButton, {
                timeout: 60000,
            });
            await page.click(this.joinButton);
            logger_1.logger.info(`${botName} joined the Meeting.`);
        };
    }
    async join() {
        if (!this.config.meetingUrl) {
            logger_1.logger.info("[GoogleMeet Error]: Meeting URL is required for Google Meet but is null.");
            return;
        }
        try {
            await this.joinMeeting(this.page, this.config.meetingUrl, this.config.botDisplayName);
        }
        catch (error) {
            console.error(error.message);
            return;
        }
        try {
            const [isAdmitted] = await Promise.all([
                this.waitForMeetingAdmission().catch((error) => {
                    logger_1.logger.info(error.message);
                    return false;
                }),
            ]);
            if (!isAdmitted) {
                console.error("Bot was not admitted into the meeting");
                return;
            }
            //join the meeting
        }
        catch (error) {
            console.error(error.message);
            return;
        }
    }
    async leave() {
        logger_1.logger.info("[leaveGoogleMeet] Triggering leave action in browser context...");
        if (!this.page || this.page.isClosed()) {
            logger_1.logger.info("[leaveGoogleMeet] Page is not available or closed.");
            return false;
        }
        try {
            // Call the function exposed within the page's evaluate context
            const result = await this.page.evaluate(async () => {
                if (typeof window.performLeaveAction === "function") {
                    return await window.performLeaveAction();
                }
                else {
                    window.logger.infoBot?.("[Node Eval Error] performLeaveAction function not found on window.");
                    console.error("[Node Eval Error] performLeaveAction function not found on window.");
                    return false;
                }
            });
            logger_1.logger.info(`[leaveGoogleMeet] Browser leave action result: ${result}`);
            return result;
        }
        catch (error) {
            logger_1.logger.info(`[leaveGoogleMeet] Error calling performLeaveAction in browser: ${error.message}`);
            return false;
        }
    }
}
exports.GoogleMeet = GoogleMeet;
