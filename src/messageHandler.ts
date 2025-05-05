import {IStorageService} from "./storageService";
import {ExtensionMessage, ExtensionResponse} from "./types";
import {WebhookService} from "./webhookService";

/**
 * Interface that all message handlers must implement.
 * Provides a mechanism to determine if a handler can process a message
 * and a method to perform the handling logic.
 */
export interface MessageHandler {
  canHandle(message: ExtensionMessage): boolean;
  handle(message: ExtensionMessage, sendResponse: (response: ExtensionResponse) => void): void | Promise<void>;
}

/**
 * Handles the "new_meeting_started" message type.
 * Saves the current active tab ID to local Chrome storage under `meetingTabId`.
 */
export class MeetingStartedHandler implements MessageHandler {
  constructor(private storageService: IStorageService) {}

  canHandle(message: ExtensionMessage): boolean {
    return message.type === "meetingStarted";
  }

  async handle(_: ExtensionMessage): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const tabId = tabs[0]?.id;

      if (tabId !== undefined) {
        await this.storageService.set("meetingTabId", tabId);
        console.log("Meeting tab id saved");
      }
    } catch (error) {
      console.error("Error saving meeting tab ID:", error);
    }
  }
}

/**
 * Handles the "meeting_ended" message type.
 * Processes the last meeting and clears stored tab ID.
 */
export class MeetingEndedHandler implements MessageHandler {
  constructor(private webhook: WebhookService, private storage: IStorageService) {}

  canHandle(message: ExtensionMessage): boolean {
    return message.type === "meetingEnded";
  }

  async handle(): Promise<void> {
    await this.webhook.process();
    await this.storage.remove("meeting");
    chrome.runtime.reload();
  }
}
