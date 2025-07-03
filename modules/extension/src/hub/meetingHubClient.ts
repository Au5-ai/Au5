import * as signalR from "@microsoft/signalr";
import {AppConfiguration, IMeetingPlatform, IMessage, MessageTypes, UserJoinedInMeetingMessage} from "../core/types";
import {ChatPanel} from "../ui/chatPanel";

export class MeetingHubClient {
  private connection: signalR.HubConnection;
  private meetingId: string;
  private config: AppConfiguration;
  private platform: IMeetingPlatform;
  private chatPanel: ChatPanel;

  constructor(config: AppConfiguration, platform: IMeetingPlatform, chatPanel: ChatPanel) {
    this.config = config;
    this.platform = platform;
    this.meetingId = platform.getMeetingId();
    this.chatPanel = chatPanel;
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
        this.connection.on("ReceiveMessage", (msg: IMessage) => {
          messageHandler(msg);
        });
        return true;
      })
      .catch(err => {
        console.error("SignalR connection failed:", err);
      });
    return false;
  }

  public async sendMessage(payload: IMessage): Promise<void> {
    try {
      await this.connection.invoke(payload.type, payload);
    } catch (err) {
      console.error(`[SignalR] Failed to send message (${payload.type}):`, err);
    }
  }

  public onDisconnect(handler: (error?: Error) => void): void {
    this.connection.onclose(error => {
      this.chatPanel.isOffline();
      handler(error ?? undefined);
    });

    this.connection.onreconnecting(error => {
      this.chatPanel.showReconnecting();
    });

    this.connection.onreconnected(connectionId => {
      this.chatPanel.isOnline();
    });
  }
}
