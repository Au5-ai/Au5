import * as signalR from "@microsoft/signalr";
import {
  JoinMeeting,
  MeetingConfiguration,
  TranscriptionEntryMessage,
} from "../types";

export class MeetingHubClient {
  private connection: signalR.HubConnection;

  constructor(private config: MeetingConfiguration) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(config.hubUrl)
      .withAutomaticReconnect()
      .build();
  }

  public async startConnection(): Promise<void> {
    try {
      await this.connection.start();
      await this.connection.invoke("JoinMeeting", {
        meetingId: this.config.meetingId,
      } as JoinMeeting);
    } catch (err) {
      console.error("[SignalR] Connection failed:", err);
    }
  }

  public async sendMessage(
    action: string,
    payload: TranscriptionEntryMessage
  ): Promise<void> {
    try {
      await this.connection.invoke(action, payload);
    } catch (err) {
      console.error(`[SignalR] Failed to send message (${action}):`, err);
    }
  }
}
