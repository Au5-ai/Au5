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
 * Contains DOM selectors for meeting controls.
 * @property leaveButton - Selector for the leave button.
 * @property enterNameField - Selector for the name input field. Example: 'input[type="text"][aria-label="Your name"]'
 * @property joinButton - Selector for the join button. Example: '//button[.//span[text()="Ask to join"]]'
 * @property muteButton - Selector for the mute button. Example: '[aria-label*="Turn off microphone"]'
 * @property cameraOffButton - Selector for the camera off button. Example: '[aria-label*="Turn off camera"]'
 */
export type MeetingDom = {
    leaveButton: string;
    enterNameField: string;
    joinButton: string;
    muteButton: string;
    cameraOffButton: string;
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
 * @property meetingDom - DOM selectors for meeting controls.
 */
export type MeetingConfiguration = {
    hubUrl: string;
    platform: MeetingPlatform;
    meetingUrl: string | null;
    model: "liveVoice" | "liveCaption";
    botDisplayName: string;
    meetingId: string;
    language?: string | null;
    autoLeave: AutoLeaveTimeouts;
    meetingDom: MeetingDom;
};
/**
 * Interface for meeting platform handlers.
 * @method handle - Handles the meeting session logic.
 * @returns Promise that resolves when handling is complete.
 * @method leave - Leaves the meeting.
 * @returns Promise that resolves to true if the bot left successfully, false otherwise.
 */
export interface IMeetingPlatform {
    join(): Promise<void>;
    leave(): Promise<boolean>;
}
