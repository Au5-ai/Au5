import { Page } from "playwright-core";
import {
  IMeetingPlatform,
  MeetingConfiguration,
  TranscriptionEntryMessage,
} from "../../types";
import { logger } from "../../utils/logger";
import { randomDelay } from "../../utils";
import { TranscriptMutationHandler } from "./transcriptMutationHandler";
import {
  Google_Caption_Configuration,
  RANDOM_DELAY_MAX,
  WAIT_FOR_JOIN_BUTTON_TIMEOUT,
  WAIT_FOR_NAME_FIELD_TIMEOUT,
} from "./constants";

export class GoogleMeet implements IMeetingPlatform {
  constructor(private config: MeetingConfiguration, private page: Page) {}

  PREPARE_DELAY_MS = this.config.delayBeforeInteraction ?? 5000;

  private selectors = {
    leaveButton: `//button[@aria-label="Leave call"]`,
    enterNameField: 'input[type="text"][aria-label="Your name"]',
    joinButton: '//button[.//span[text()="Ask to join"]]',
    muteButton: '[aria-label*="Turn off microphone"]',
    cameraOffButton: '[aria-label*="Turn off camera"]',
  };

  async joinMeeting(): Promise<boolean> {
    const { meetingUrl, botDisplayName } = this.config;

    if (!meetingUrl) {
      logger.error(
        "[GoogleMeet][Join] Meeting URL is missing in the configuration."
      );
      return false;
    }

    try {
      await this.navigateAndPrepareToJoin(meetingUrl, botDisplayName);
      const isAdmitted = await this.waitForMeetingAdmission();
      if (!isAdmitted) {
        logger.warn(
          `[GoogleMeet][Join] Bot "${botDisplayName}" was not admitted to the meeting.`
        );
        return false;
      }
      return true;
    } catch (error: any) {
      logger.error(
        `[GoogleMeet][Join] Failed to join meeting: ${error.message}`
      );
    }
    return false;
  }

  async leaveMeeting(): Promise<boolean> {
    if (!this.page || this.page.isClosed()) {
      logger.warn(
        "[GoogleMeet][Leave] Page context is unavailable or already closed."
      );
      return false;
    }

    try {
      const result = await this.page.evaluate(() => {
        const leaveFn = (window as any).performLeaveAction;
        if (typeof leaveFn === "function") {
          return leaveFn();
        }
        console.error(
          "[GoogleMeet][Leave] performLeaveAction function not found on window."
        );
        return false;
      });

      return result;
    } catch (error: any) {
      logger.error(
        `[GoogleMeet][Leave] Failed to trigger leave action: ${error.message}`
      );
      return false;
    }
  }

  async startTranscription(
    handler: (message: TranscriptionEntryMessage) => void
  ): Promise<void> {
    if (this.config.model == "liveCaption") {
      Google_Caption_Configuration.language = this.config.language || "en-US";
      new TranscriptMutationHandler(
        this.page,
        Google_Caption_Configuration
      ).initialize(handler);
    }
  }

  /**
   * Navigates to the Google Meet URL and prepares the bot for joining.
   * @param meetingUrl - The URL of the Google Meet session.
   * @param botName - The display name for the bot.
   */
  private async navigateAndPrepareToJoin(
    meetingUrl: string,
    botName: string
  ): Promise<void> {
    await this.page.goto(meetingUrl, { waitUntil: "networkidle" });
    await this.page.bringToFront();
    await this.page.waitForTimeout(
      this.PREPARE_DELAY_MS + randomDelay(RANDOM_DELAY_MAX)
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

  private async waitForMeetingAdmission(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.leaveButton, {
        timeout: this.config.autoLeave.waitingEnter,
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
    } catch {
      logger.warn(
        "[GoogleMeet][Prepare] Microphone was already muted or mute button not found."
      );
    }
  }

  private async turnOffCamera(): Promise<void> {
    try {
      await this.page.waitForTimeout(randomDelay(500));
      await this.page.click(this.selectors.cameraOffButton, { timeout: 200 });
    } catch {
      logger.warn(
        "[GoogleMeet][Prepare] Camera was already off or button not found."
      );
    }
  }
}
