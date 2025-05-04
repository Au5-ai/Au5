// =====================================================================================
// ------------------------------ ** TRANSLATED CONTENT STRUCTURES ** -----------------
// =====================================================================================

/**
 * Represents a single spoken block in a meeting transcript.
 */
export interface TranscriptBlock {
  /** Name of the person who spoke */
  personName: string;

  /** ISO timestamp of when the words were spoken */
  timestamp: string;

  /** The transcribed text spoken by the person */
  text: string;
}

/**
 * Represents a single chat message sent during a meeting or session.
 */
export interface ChatMessage {
  /** Name of the person who sent the message */
  personName: string;

  /** ISO 8601 timestamp of when the message was sent */
  timestamp: string;

  /** The actual content of the chat message */
  text: string;
}

// =====================================================================================
// ------------------------------ ** WEBHOOK PAYLOAD STRUCTURE ** --------------------
// =====================================================================================

/**
 * Structure of the webhook payload sent after a meeting.
 */
export interface WebhookBody {
  /** Title of the meeting */
  meetingTitle: string;

  /** ISO 8601 timestamp of when the meeting started */
  meetingStartAt: string;

  /** ISO 8601 timestamp of when the meeting ended */
  meetingEndAt: string;

  /**
   * Transcript content.
   * Can be either:
   * - a formatted plain string
   * - or a structured array of transcript blocks
   */
  transcript: string | TranscriptBlock[];

  /**
   * Chat messages during the meeting.
   * Can be either:
   * - a formatted plain string
   * - or a structured array of chat messages
   */
  chatMessages: string | ChatMessage[];
}

// =====================================================================================
// ------------------------------ ** LOCAL STORAGE STRUCTURES ** ----------------------
// =====================================================================================

/**
 * Represents the structure of local Chrome extension storage.
 */
export interface LocalStorageState {
  /** Current status of the extension as a structured JSON object */
  extensionStatus: ExtensionStatus;

  /** Configuration settings for the extension */
  config: Config;

  /** History of recorded or processed meetings */
  meeting: Meeting;
}

/**
 * Represents the current status of the extension.
 */
export interface ExtensionStatus {
  /** Numeric status code representing the extension's state */
  code: number;

  /** Human-readable message describing the current status */
  message: string;
}

/**
 * Represents the synced structure stored in Chrome's local storage.
 */
export interface Config {
  /** Webhook endpoint URL */
  webhookUrl: string;
  token: string;
}

// =====================================================================================
// ------------------------------ ** MEETING STRUCTURE ** ----------------------------
// =====================================================================================

/**
 * Represents a meeting and its related details.
 */
export interface Meeting {
  /** ID of the Chrome tab where the meeting is running */
  meetingTabId: number;

  /** Title of the meeting (can be optional or fallback to older key `title`) */
  meetingTitle?: string;

  /** Legacy key for meeting title */
  title?: string;

  /** ISO 8601 timestamp of when the meeting started */
  meetingStartAt: string;

  /** ISO 8601 timestamp of when the meeting ended */
  meetingEndAt: string;

  /** Transcript content as an array of structured transcript blocks */
  transcript: TranscriptBlock[];

  /** Array of chat messages exchanged during the meeting */
  chatMessages: ChatMessage[];

  /** Status of the webhook post request for the meeting */
  webhookPostStatus: "new" | "failed" | "successful";
}

// =====================================================================================
// ------------------------------ ** EXTENSION MESSAGING ** ---------------------------
// =====================================================================================

/**
 * Types of messages that can be sent from the content/background script.
 */
export type ExtensionMessageType = "new_meeting_started" | "meeting_ended" | "recover_last_meeting"; // Add more as needed (e.g., "download_transcript", "retry_webhook")

/**
 * Message sent by the calling script to communicate an action or event.
 */
export interface ExtensionMessage {
  /** Type of the message indicating the action to perform */
  type: ExtensionMessageType;

  /** Optional index of the meeting to act upon, used in actions like retry or download */
  index?: number;
}

/**
 * Standardized response returned by the receiving script after processing a message.
 */
export interface ExtensionResponse {
  /** Whether the action was handled successfully */
  success: boolean;

  /** Optional human-readable message explaining the outcome */
  message?: string;
}
