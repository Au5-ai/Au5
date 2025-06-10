/**
 * Represents the supported meeting platforms.
 * - "googleMeet": Google Meet platform.
 * - "zoom": Zoom platform.
 * - "teams": Microsoft Teams platform.
 */
export type MeetingPlatform = "googleMeet" | "zoom" | "teams";

/**
 * Defines the auto-leave timeout settings for a meeting.
 * @property waitingEnter - Timeout (in ms) while waiting to enter the meeting.
 * @property noParticipant - Timeout (in ms) when no participant is present.
 * @property allParticipantsLeft - Timeout (in ms) after all participants have left.
 */
export type AutoLeaveTimeouts = {
  waitingEnter: number;
  noParticipant: number;
  allParticipantsLeft: number;
};

/**
 * Configuration options for a meeting session.
 * @property hubUrl - The URL of the hub service.
 * @property platform - The meeting platform in use.
 * @property meetingUrl - The URL of the meeting (nullable).
 * @property model - The bot operation mode ("liveVoice" or "liveCaption").
 * @property botDisplayName - The display name for the bot.
 * @property meetingId - The unique identifier for the meeting.
 * @property language - The language code for the meeting (optional).
 * @property autoLeave - Auto-leave timeout settings.
 */
export type MeetingConfiguration = {
  hubUrl: string;
  platform: MeetingPlatform;
  meetingUrl: string | null;
  model: "liveVoice" | "liveCaption";
  botDisplayName: string;
  meetingId: string;
  language?: string | null;
  delayBeforeInteraction: number;
  autoLeave: AutoLeaveTimeouts;
};

/**
 * Interface for meeting platform handlers.
 * @method handle - Handles the meeting session logic.
 * @returns Promise that resolves when handling is complete.
 * @method leave - Leaves the meeting.
 * @returns Promise that resolves to true if the bot left successfully, false otherwise.
 * onJoined: () => void = () => {}
 */
export interface IMeetingPlatform {
  joinMeeting(): Promise<boolean>;
  leaveMeeting(): Promise<boolean>;
  startTranscription(
    handler: (message: TranscriptionEntryMessage) => void
  ): Promise<void>;
}

export interface Speaker {
  fullName: string;
  pictureUrl: string;
}

export interface JoinMeeting {
  meetingId: string;
}

export interface TranscriptionEntryMessage {
  meetingId: string;
  transcriptBlockId: string;
  speaker: Speaker;
  transcript: string;
  timestamp: Date;
  readonly type: "TranscriptionEntry";
}
