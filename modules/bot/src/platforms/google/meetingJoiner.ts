import { Page } from "playwright-core";
import { logger } from "../../common/utils/logger";
import { randomDelay } from "../../common/utils";
import {
  RANDOM_DELAY_MAX,
  WAIT_FOR_JOIN_BUTTON_TIMEOUT,
  WAIT_FOR_NAME_FIELD_TIMEOUT,
} from "./constants";

export class MeetingJoiner {
  private selectors = {
    leaveButton: `//button[@aria-label="Leave call"]`,
    enterNameField: 'input[type="text"][aria-label="Your name"]',
    joinButton: '//button[.//span[text()="Ask to join" or text()="Join now"]]',
    muteButton: '[aria-label*="Turn off microphone"]',
    cameraOffButton: '[aria-label*="Turn off camera"]',
  };

  constructor(private page: Page, private prepareDelayMs: number) {}

  async join(
    meetingUrl: string,
    botName: string,
    admissionTimeout: number
  ): Promise<boolean> {
    await this.navigateAndPrepare(meetingUrl, botName);
    return await this.waitForAdmission(admissionTimeout);
  }

  private async navigateAndPrepare(
    meetingUrl: string,
    botName: string
  ): Promise<void> {
    await this.page.goto(meetingUrl, { waitUntil: "networkidle" });
    await this.page.bringToFront();
    await this.page.waitForTimeout(
      this.prepareDelayMs + randomDelay(RANDOM_DELAY_MAX)
    );

    await this.page.waitForSelector(this.selectors.enterNameField, {
      timeout: WAIT_FOR_NAME_FIELD_TIMEOUT,
    });
    await this.page.fill(this.selectors.enterNameField, botName);

    await this.muteMic();
    await this.turnOffCamera();

    await this.page.waitForSelector(this.selectors.joinButton, {
      timeout: WAIT_FOR_JOIN_BUTTON_TIMEOUT,
    });
    await this.page.click(this.selectors.joinButton);
  }

  private async waitForAdmission(timeout: number): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.leaveButton, {
        timeout,
      });
      return true;
    } catch {
      logger.warn(
        "[GoogleMeet][Admission] Bot was not admitted within the timeout period."
      );
      return false;
    }
  }

  private async muteMic(): Promise<void> {
    try {
      await this.page.waitForTimeout(randomDelay(500));
      await this.page.click(this.selectors.muteButton, { timeout: 200 });
    } catch (error: any) {
      logger.warn(
        `[GoogleMeet][Prepare] Microphone was already muted or mute button not found: ${error.message}`
      );
    }
  }

  private async turnOffCamera(): Promise<void> {
    try {
      await this.page.waitForTimeout(randomDelay(500));
      await this.page.click(this.selectors.cameraOffButton, { timeout: 200 });
    } catch (error: any) {
      logger.warn(
        `[GoogleMeet][Prepare] Camera was already off or button not found: ${error.message}`
      );
    }
  }
}
