// =====================================================================================
// ------------------------------ ** TRANSCRIPT & CHAT STRUCTURES ** -------------------
// =====================================================================================

/**
 * Represents a single spoken block in a meeting transcript.
 */
export interface ITranscriptBlock {
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
export interface IChatMessage {
  /** Name of the person who sent the message */
  personName: string;

  /** ISO 8601 timestamp of when the message was sent */
  timestamp: string;

  /** The actual content of the chat message */
  text: string;
}

// =====================================================================================
// ------------------------------ ** MEETING STRUCTURE ** -----------------------------
// =====================================================================================

/**
 * Represents a meeting and its related details.
 */
export interface IMeeting {
  /** ID of the Chrome tab where the meeting is running */
  tabId: number;

  /** Title of the meeting (can be optional or fallback to older key `title`) */
  title?: string;

  /** ISO 8601 timestamp of when the meeting started */
  startAt: string;

  /** ISO 8601 timestamp of when the meeting ended */
  endAt: string;

  /** Transcript content as an array of structured transcript blocks */
  transcript: ITranscriptBlock[];

  /** Array of chat messages exchanged during the meeting */
  chatMessages: IChatMessage[];
}

// =====================================================================================
// ------------------------------ ** LOCAL STORAGE STRUCTURES ** -----------------------
// =====================================================================================

/**
 * Represents the structure of local Chrome extension storage.
 */
export interface ILocalStorageState {
  /** Current status of the extension as a structured JSON object */
  extensionStatus: IExtensionStatus;

  /** Configuration settings for the extension */
  config: IConfiguration;

  /** History of recorded or processed meetings */
  meeting: IMeeting;
}

/**
 * Represents the current status of the extension.
 */
export interface IExtensionStatus {
  /** Numeric status code representing the extension's state */
  code: number;

  /** Human-readable message describing the current status */
  message: string;
}

/**
 * Represents the synced structure stored in Chrome's local storage.
 */
export interface IConfiguration {
  /** Webhook endpoint URL */
  webhookUrl: string;

  /** Authentication token for the webhook */
  token: string;
}

// =====================================================================================
// ------------------------------ ** EXTENSION MESSAGING ** ----------------------------
// =====================================================================================

/**
 * Types of messages that can be sent from the content/background script.
 */
export type ExtensionMessageType = "meetingStarted" | "meetingEnded";

/**
 * Message sent by the calling script to communicate an action or event.
 */
export interface IExtensionMessage {
  /** Type of the message indicating the action to perform */
  type: ExtensionMessageType;

  /** Optional index of the meeting to act upon, used in actions like retry or download */
  index?: number;
}

/**
 * Standardized response returned by the receiving script after processing a message.
 */
export interface IExtensionResponse {
  /** Whether the action was handled successfully */
  success: boolean;

  /** Optional human-readable message explaining the outcome */
  message?: string;
}

/**
 * Interface that all message handlers must implement.
 * Provides a mechanism to determine if a handler can process a message
 * and a method to perform the handling logic.
 */
export interface IMessageHandler {
  /**
   * Determines if the handler can process the given message.
   * @param message The message to check.
   */
  canHandle(message: IExtensionMessage): boolean;

  /**
   * Handles the given message.
   * @param message The message to handle.
   * @param sendResponse Callback to send the response.
   */
  handle(message: IExtensionMessage, sendResponse: (response: IExtensionResponse) => void): void | Promise<void>;
}

// =====================================================================================
// ------------------------------ ** Local Storage ** ----------------------------------
// =====================================================================================

export interface IStorageService {
  set<T>(key: string, value: T): Promise<void>;
  get<T>(key: string | string[]): Promise<T>;
  remove(keys: string | string[]): Promise<void>;
}
