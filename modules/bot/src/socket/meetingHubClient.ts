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
      .withUrl(this.config.hubUrl)
      .withAutomaticReconnect()
      .build();
  }

  public async startConnection(): Promise<boolean> {
    try {
      await this.connection.start();
      await this.connection.invoke("BotJoinMeeting", {
        meetingId: this.config.meetingId,
      } as JoinMeeting);
    } catch (err) {
      console.error("[SignalR] Connection failed:", err);
      return false;
    }
    return true;
  }

  public async sendMessage(payload: TranscriptionEntryMessage): Promise<void> {
    try {
      await this.connection.invoke(payload.type, payload);
    } catch (err) {
      console.error(`[SignalR] Failed to send message (${payload.type}):`, err);
    }
  }
}
