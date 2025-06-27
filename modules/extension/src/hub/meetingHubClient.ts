import * as signalR from "@microsoft/signalr";
import {AppConfiguration, IMeetingPlatform, IMessage, MessageTypes, UserJoinedInMeetingMessage} from "../core/types";

export class MeetingHubClient {
  private connection: signalR.HubConnection;
  private meetingId: string;
  private config: AppConfiguration;
  private platform: IMeetingPlatform;

  constructor(config: AppConfiguration, platform: IMeetingPlatform) {
    this.config = config;
    this.platform = platform;
    this.meetingId = platform.getMeetingId();
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.config.service.hubUrl)
      .withAutomaticReconnect()
      .build();
  }

  public startConnection(messageHandler: (msg: IMessage) => void): boolean {
    this.connection
      .start()
      .then(() => {
        this.connection.invoke(MessageTypes.UserJoinedInMeeting, {
          meetingId: this.meetingId,
          user: {
            id: this.config.user.id,
            fullName: this.config.user.fullName,
            pictureUrl: this.config.user.pictureUrl
          },
          platform: this.platform.getPlatformName()
        } as UserJoinedInMeetingMessage);
      })
      .then(() => {
        this.connection.on("ReceiveMessage", (msg: IMessage) => {
          messageHandler(msg);
        });
      })
      .catch(err => {
        console.error("SignalR connection failed:", err);
        return false;
      });
    return true;
  }

  public async sendMessage(payload: IMessage): Promise<void> {
    try {
      await this.connection.invoke(payload.type, payload);
    } catch (err) {
      console.error(`[SignalR] Failed to send message (${payload.type}):`, err);
    }
  }
}
