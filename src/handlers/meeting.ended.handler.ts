import {ExtensionMessage, IMessageHandler, IStorageService} from "../types";
import {WebhookService} from "../services/API";

/**
 * Handles the "meeting_ended" message type.
 * Processes the last meeting and clears stored tab ID.
 */
export class MeetingEndedHandler implements IMessageHandler {
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
