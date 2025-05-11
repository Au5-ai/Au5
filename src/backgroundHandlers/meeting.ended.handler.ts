import {apiRequest} from "../services/api/apiRequest";
import {ExtensionMessage, IMessageHandler, IStorageService} from "../types";

/**
 * Handles the "meeting_ended" message type.
 * Processes the last meeting and clears stored tab ID.
 */
export class MeetingEndedHandler implements IMessageHandler {
  constructor(private storage: IStorageService) {}

  canHandle(message: ExtensionMessage): boolean {
    return message.type === "meetingEnded";
  }

  async handle(): Promise<void> {
    await apiRequest<string, string>("/items", {
      method: "POST",
      body: "New item",
      authToken: "my-token"
    });
    await this.storage.remove("meeting");
    chrome.runtime.reload();
  }
}
