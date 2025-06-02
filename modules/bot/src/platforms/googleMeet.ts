import { Page } from "playwright-core";
import { IMeetingPlatform, MeetingConfiguration } from "../types";
import { logger } from "../utils/logger";
import { randomDelay } from "../utils";

export class GoogleMeet implements IMeetingPlatform {
  constructor(private config: MeetingConfiguration, private page: Page) {}

  async join(): Promise<void> {
    //const leaveButton = `//button[@aria-label="Leave call"]`;

    if (!this.config.meetingUrl) {
      logger.info(
        "[GoogleMeet Error]: Meeting URL is required for Google Meet but is null."
      );
      return;
    }

    try {
      await this.joinMeeting(
        this.page,
        this.config.meetingUrl,
        this.config.botDisplayName
      );
    } catch (error: any) {
      console.error(error.message);
      return;
    }

    try {
      const [isAdmitted] = await Promise.all([
        this.waitForMeetingAdmission().catch((error) => {
          logger.info(error.message);
          return false;
        }),
      ]);

      if (!isAdmitted) {
        console.error("Bot was not admitted into the meeting");
        return;
      }

      //join the meeting
    } catch (error: any) {
      console.error(error.message);
      return;
    }
  }

  waitForMeetingAdmission = async (): Promise<boolean> => {
    try {
      await this.page.waitForSelector(this.config.meetingDom.leaveButton, {
        timeout: this.config.autoLeave.waitingEnter,
      });
      return true;
    } catch {
      throw new Error(
        "[GoogleMeet Error] Bot was not admitted into the meeting within the timeout period"
      );
    }
  };

  joinMeeting = async (page: Page, meetingUrl: string, botName: string) => {
    // const enterNameField = 'input[type="text"][aria-label="Your name"]';
    // const joinButton = '//button[.//span[text()="Ask to join"]]';
    // const muteButton = '[aria-label*="Turn off microphone"]';
    // const cameraOffButton = '[aria-label*="Turn off camera"]';

    await page.goto(meetingUrl, { waitUntil: "networkidle" });
    await page.bringToFront();
    await page.waitForTimeout(5000);
    await page.waitForTimeout(randomDelay(1000));
    await page.waitForSelector(this.config.meetingDom.enterNameField, {
      timeout: 120000,
    });
    await page.waitForTimeout(randomDelay(1000));
    await page.fill(this.config.meetingDom.enterNameField, botName);

    try {
      await page.waitForTimeout(randomDelay(500));
      await page.click(this.config.meetingDom.muteButton, { timeout: 200 });
      await page.waitForTimeout(200);
    } catch (e) {
      logger.info("Microphone already muted or not found.");
    }

    try {
      await page.waitForTimeout(randomDelay(500));
      await page.click(this.config.meetingDom.cameraOffButton, {
        timeout: 200,
      });
      await page.waitForTimeout(200);
    } catch (e) {
      logger.info("Camera already off or not found.");
    }

    await page.waitForSelector(this.config.meetingDom.joinButton, {
      timeout: 60000,
    });
    await page.click(this.config.meetingDom.joinButton);
    logger.info(`${botName} joined the Meeting.`);
  };

  async leave(): Promise<boolean> {
    logger.info(
      "[leaveGoogleMeet] Triggering leave action in browser context..."
    );
    if (!this.page || this.page.isClosed()) {
      logger.info("[leaveGoogleMeet] Page is not available or closed.");
      return false;
    }
    try {
      // Call the function exposed within the page's evaluate context
      const result = await this.page.evaluate(async () => {
        if (typeof (window as any).performLeaveAction === "function") {
          return await (window as any).performLeaveAction();
        } else {
          (window as any).logger.infoBot?.(
            "[Node Eval Error] performLeaveAction function not found on window."
          );
          console.error(
            "[Node Eval Error] performLeaveAction function not found on window."
          );
          return false;
        }
      });
      logger.info(`[leaveGoogleMeet] Browser leave action result: ${result}`);
      return result;
    } catch (error: any) {
      logger.info(
        `[leaveGoogleMeet] Error calling performLeaveAction in browser: ${error.message}`
      );
      return false;
    }
  }
}
