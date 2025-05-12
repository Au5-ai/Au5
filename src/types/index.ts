import {AppConfiguration} from "../services/config.service";

// =====================================================================================
// ------------------------------ ** TRANSCRIPT & CHAT STRUCTURES ** -------------------
// =====================================================================================

/**
 * Represents a single spoken block in a meeting transcript.
 */
export interface TranscriptBlock {
  /** Name of the person who spoke */
  speaker: string;

  /** ISO timestamp of when the words were spoken */
  timestamp: string;

  /** The transcribed text spoken by the person */
  transcript: string;
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
// ------------------------------ ** MEETING STRUCTURE ** -----------------------------
// =====================================================================================

/**
 * Represents a meeting and its related details.
 */
export interface Meeting {
  /** ID of the Chrome tab where the meeting is running */
  tabId: number;

  /** Title of the meeting (can be optional or fallback to older key `title`) */
  title?: string;

  /** ISO 8601 timestamp of when the meeting started */
  startAt: string;

  /** ISO 8601 timestamp of when the meeting ended */
  endAt: string;

  /** Transcript content as an array of structured transcript blocks */
  transcript: TranscriptBlock[];

  /** Array of chat messages exchanged during the meeting */
  chatMessages: ChatMessage[];
}

// =====================================================================================
// ------------------------------ ** LOCAL STORAGE STRUCTURES ** -----------------------
// =====================================================================================

/**
 * Represents the structure of local Chrome extension storage.
 */
export interface LocalStorageModel {
  /** Configuration settings for the extension */
  appConfig: AppConfiguration; //TODO : remove this and use the config service instead

  /** History of recorded or processed meetings */
  meeting: Meeting;
}

// =====================================================================================
// ------------------------------ ** EXTENSION MESSAGING ** ----------------------------
// =====================================================================================

/**
 * Types of messages that can be sent from the content/background script.
 */
export enum ExtensionMessageType {
  MEETING_STARTED = "meetingStarted",
  MEETING_ENDED = "meetingEnded"
}

/**
 * Message sent by the calling script to communicate an action or event.
 */
export interface ExtensionMessage {
  /** Type of the message indicating the action to perform */
  type: ExtensionMessageType;

  /** Optional data associated with the message */
  value?: any;
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
  canHandle(message: ExtensionMessage): boolean;

  /**
   * Handles the given message.
   * @param message The message to handle.
   * @param sendResponse Callback to send the response.
   */
  handle(message: ExtensionMessage, sendResponse: (response: ExtensionResponse) => void): void | Promise<void>;
}

// =====================================================================================
// ------------------------------ ** Browser Service ** ----------------------------------
// =====================================================================================

export interface IBrowserService {
  reload(): void;
  sendMessage(message: ExtensionMessage, responseCallback?: (response: ExtensionResponse) => void): void;
}

export interface IStorageService {
  set<T>(key: string, value: T): Promise<void>;
  get<T>(key: string | string[]): Promise<T>;
  remove(keys: string | string[]): Promise<void>;
  getSync<T>(key: string): Promise<T>;
}

export interface IconData {
  selector: string;
  text: string;
}

export interface PipelineContext {
  meetingTitle?: string;
  captionsButton?: HTMLElement | null;
  transcriptContainer?: HTMLElement | null;
  canUseAriaBasedTranscriptSelector: boolean;
  hasMeetingStarted: boolean;
}
