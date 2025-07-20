import * as signalR from "@microsoft/signalr";
import { MeetingConfiguration, EntryMessage } from "../types";

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
      await this.connection.invoke("BotJoinedInMeeting", this.config.meetId);
    } catch (err) {
      console.error("[SignalR] Connection failed:", err);
      return false;
    }
    return true;
  }

  public async sendMessage(payload: EntryMessage): Promise<void> {
    try {
      await this.connection.invoke(payload.type, payload);
    } catch (err) {
      console.error(`[SignalR] Failed to send message (${payload.type}):`, err);
    }
  }
}
