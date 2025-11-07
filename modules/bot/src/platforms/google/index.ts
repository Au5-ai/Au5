import { Page } from "playwright-core";
import {
  IMeetingPlatform,
  MeetingConfiguration,
  EntryMessage,
  Participant,
} from "../../types";
import { logger } from "../../common/utils/logger";
import { delay } from "../../common/utils";
import { CaptionMutationHandler } from "./caption-mutation-handler";
import { ParticipantMutationHandler } from "./participant-mutation-handler";
import {
  GOOGLE_CAPTION_CONFIGURATION,
  CAPTION_UI_STABILIZATION_DELAY,
} from "./constants";
import { CaptionEnabler } from "./caption-enabler";
import { MeetingJoiner } from "./meeting-joiner";

export class GoogleMeet implements IMeetingPlatform {
  constructor(private config: MeetingConfiguration, private page: Page) {}

  async joinMeeting(): Promise<boolean> {
    const { meetingUrl, botDisplayName } = this.config;

    if (!meetingUrl) {
      logger.error(
        "[GoogleMeet][Join] Meeting URL is missing in the configuration."
      );
      return false;
    }

    try {
      const prepareDelayMs = this.config.delayBeforeInteraction ?? 5000;
      const joiner = new MeetingJoiner(this.page, prepareDelayMs);
      const isAdmitted = await joiner.join(
        meetingUrl,
        botDisplayName,
        this.config.autoLeave.waitingEnter
      );

      if (!isAdmitted) {
        logger.info(
          `[GoogleMeet][NotJoin] Bot "${botDisplayName}" was not admitted to the meeting.`
        );
        return false;
      }
      logger.info(
        `[GoogleMeet][Join] Bot "${botDisplayName}" was admitted to the meeting.`
      );
      return true;
    } catch (error: any) {
      logger.error(
        `[GoogleMeet][Join] Failed to join meeting: ${error.message}`
      );
      return false;
    }
  }

  async observeTranscriptions(
    pushToHubCallback: (message: EntryMessage) => void
  ): Promise<void> {
    if (
      this.config.meeting_settings.transcription &&
      this.config.meeting_settings.transcription_model === "liveCaption"
    ) {
      const captionConfig = {
        ...GOOGLE_CAPTION_CONFIGURATION,
        language: this.config.language || "en-US",
      };

      await new CaptionEnabler(this.page).activate(captionConfig.language);
      await delay(CAPTION_UI_STABILIZATION_DELAY);

      logger.info(
        "[GoogleMeet][Participants] Starting participant observation..."
      );
      await new CaptionMutationHandler(this.page, captionConfig).observe(
        pushToHubCallback
      );
    }
  }

  async observeParticipations(
    pushToHubCallback: (participants: Participant[]) => void
  ): Promise<void> {
    try {
      await delay(2000);
      await new ParticipantMutationHandler(
        this.page,
        pushToHubCallback
      ).observe();
    } catch (error: any) {
      throw error;
    }
  }

  async leaveMeeting(): Promise<boolean> {
    if (!this.page || this.page.isClosed()) {
      return false;
    }

    try {
      const result = await this.page.evaluate(() => {
        const leaveFn = (window as any).performLeaveAction;
        if (typeof leaveFn === "function") {
          return leaveFn();
        }
        return false;
      });

      return result;
    } catch (error: any) {
      return false;
    }
  }
}
