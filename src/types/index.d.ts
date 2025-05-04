/**
 * A chunk of transcript
 */
export interface TranscriptBlock {
  personName: string; // Name of the person who spoke
  timestamp: string; // ISO timestamp of when the words were spoken
  transcriptText: string; // Actual transcript text
}

/**
 * A chat message
 */
export interface ChatMessage {
  personName: string; // Name of the person who sent the message
  timestamp: string; // ISO timestamp of when the message was sent
  chatMessageText: string; // Actual message text
}

/**
 * Webhook body structure
 */
export interface WebhookBody {
  meetingTitle: string; // Title of the meeting
  meetingStartTimestamp: string; // ISO timestamp of when the meeting started
  meetingEndTimestamp: string; // ISO timestamp of when the meeting ended
  transcript: TranscriptBlock[] | string; // Transcript as a formatted string or array of transcript blocks
  chatMessages: ChatMessage[] | string; // Chat messages as a formatted string or array of chat messages
}

/**
 * Local chrome storage structure
 */
export interface ResultLocal {
  extensionStatusJSON: ExtensionStatusJSON;
  meetingTabId: MeetingTabId;
  meetingTitle: MeetingTitle;
  meetingStartTimestamp: MeetingStartTimestamp;
  transcript: Transcript;
  chatMessages: ChatMessages;
  isDeferredUpdatedAvailable: IsDeferredUpdatedAvailable;
  meetings: Meeting[];
}

/**
 * Extension status JSON structure
 */
export interface ExtensionStatusJSON {
  status: number; // Status of the extension
  message: string; // Message of the status
}

/**
 * Meeting structure
 */
export interface Meeting {
  meetingTitle?: string; // Title of the meeting
  title?: string; // Older key for meetingTitle
  meetingStartTimestamp: string; // ISO timestamp of when the meeting started
  meetingEndTimestamp: string; // ISO timestamp of when the meeting ended
  transcript: TranscriptBlock[]; // Array of transcript blocks
  chatMessages: ChatMessage[]; // Array of chat messages
  webhookPostStatus: "new" | "failed" | "successful"; // Status of the webhook post request
}

/**
 * Tab ID of the meeting tab
 * A valid value indicates a meeting is in progress. Set to null once the meeting ends and processing is complete.
 */
export type MeetingTabId = number | null;

/**
 * ISO timestamp of when the most recent meeting started
 */
export type MeetingStartTimestamp = string;

/**
 * Title of the most recent meeting
 */
export type MeetingTitle = string;

/**
 * Transcript of the most recent meeting
 */
export type Transcript = TranscriptBlock[];

/**
 * Chat messages captured during the most recent meeting
 */
export type ChatMessages = ChatMessage[];

/**
 * Whether the extension has a deferred update waiting to be applied
 */
export type IsDeferredUpdatedAvailable = boolean;

/**
 * Sync chrome storage structure
 */
export interface ResultSync {
  autoPostWebhookAfterMeeting: AutoPostWebhookAfterMeeting;
  operationMode: OperationMode;
  webhookBodyType: WebhookBodyType;
  webhookUrl: WebhookUrl;
}

/**
 * Whether to automatically post the webhook after each meeting
 */
export type AutoPostWebhookAfterMeeting = boolean;

/**
 * Mode of the extension, deciding whether to automatically capture transcripts or let the user decide per meeting
 */
export type OperationMode = "auto" | "manual";

/**
 * Type of webhook body to use
 */
export type WebhookBodyType = "simple" | "advanced";

/**
 * URL of the webhook
 */
export type WebhookUrl = string;

/**
 * Message sent by the calling script
 */
export interface ExtensionMessage {
  type:
    | "new_meeting_started"
    | "meeting_ended"
    | "download_transcript_at_index"
    | "retry_webhook_at_index"
    | "recover_last_meeting"; // Type of message
  index?: number; // Index of the meeting to process
}

/**
 * Response sent by the called script
 */
export interface ExtensionResponse {
  success: boolean; // Whether the message was processed successfully
  message?: string | undefined; // Message explaining success or failure
}
