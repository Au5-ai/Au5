import {MESSAGES} from "./constants";
import {ILocalStorageState, IMeeting, IStorageService, STORAGE_KEYS} from "./types";

const HEADERS = {
  JSON: {"Content-Type": "application/json"}
};

export class WebhookService {
  constructor(private storage: IStorageService) {}

  async post(url: string, payload: IMeeting): Promise<void> {
    const response = await fetch(url, {
      method: "POST",
      headers: HEADERS.JSON,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    await this.storage.remove(STORAGE_KEYS.MEETING);
    chrome.runtime.reload();
  }

  async process(): Promise<string> {
    const config = await this.storage.getSync<ILocalStorageState>(STORAGE_KEYS.CONFIG);

    if (!config.config.webhookUrl) {
      return MESSAGES.NO_WEBHOOK_URL;
    }

    const meeting = await this.pickupMeeting();
    await this.post(config.config.webhookUrl, meeting);
    return MESSAGES.WEBHOOK_POSTED;
  }

  private async pickupMeeting(): Promise<IMeeting> {
    const result = await this.storage.get<ILocalStorageState>(STORAGE_KEYS.MEETING);

    if (!result.meeting.startAt) {
      throw new Error(MESSAGES.NO_MEETING_FOUND);
    }

    if (!result.meeting.transcript.length && !result.meeting.chatMessages.length) {
      throw new Error(MESSAGES.EMPTY_MEETING_DATA);
    }

    return result.meeting;
  }
}
