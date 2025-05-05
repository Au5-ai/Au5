import {StorageService} from "./storageService";
import {LocalStorageState, Meeting} from "./types";

export class WebhookService {
  constructor(private storage: StorageService) {}

  async post(url: string, payload: Meeting): Promise<void> {
    const response = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    await this.storage.remove("meeting");
    chrome.runtime.reload();
  }

  async process(): Promise<string> {
    const config = await this.storage.getSync<LocalStorageState>("config");

    if (!config.config.webhookUrl) {
      return "No webhook URL configured";
    }

    const meeting = await this.pickupMeeting();
    await this.post(config.config.webhookUrl, meeting);
    return "Webhook posted";
  }

  private async pickupMeeting(): Promise<Meeting> {
    const result = await this.storage.get<LocalStorageState>("meeting");

    if (!result.meeting.startAt) {
      throw new Error("No meetings found. Maybe attend one?");
    }

    if (!result.meeting.transcript.length && !result.meeting.chatMessages.length) {
      throw new Error("Empty transcript and chatMessages");
    }

    return result.meeting;
  }
}
