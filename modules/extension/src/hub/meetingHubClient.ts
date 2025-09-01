import * as signalR from "@microsoft/signalr";
import {AppConfiguration, IMeetingPlatform, IMessage, MessageTypes, UserJoinedInMeetingMessage} from "../core/types";
import {ChatPanel} from "../ui/chatPanel";

export class MeetingHubClient {
  private connection: signalR.HubConnection;
  private meetId: string;
  private config: AppConfiguration;
  private platform: IMeetingPlatform;
  private chatPanel: ChatPanel;

  constructor(config: AppConfiguration, platform: IMeetingPlatform, chatPanel: ChatPanel) {
    this.config = config;
    this.platform = platform;
    this.meetId = platform.getMeetId();
    this.chatPanel = chatPanel;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.config.service.hubUrl, {
        accessTokenFactory: () => {
          return this.config.service.jwtToken || "";
        }
      })
      .withAutomaticReconnect()
      .build();

    this.connection.onclose(err => {
      this.chatPanel.isOffline();
    });

    this.connection.onreconnecting(err => {
      this.chatPanel.isOffline();
    });

    this.connection.onreconnected(connId => {
      this.chatPanel.isOnline();
    });
  }

  public startConnection(messageHandler: (msg: IMessage) => void): boolean {
    this.connection
      .start()
      .then(() => {
        this.connection.invoke(MessageTypes.UserJoinedInMeeting, {
          meetId: this.meetId,
          user: {
            id: this.config.user.id,
            fullName: this.config.user.fullName,
            pictureUrl: this.config.user.pictureUrl,
            hasAccount: this.config.user.hasAccount
          },
          platform: this.platform.getPlatformName()
        } as UserJoinedInMeetingMessage);
        this.connection.on("ReceiveMessage", (msg: IMessage) => {
          messageHandler(msg);
        });
        this.chatPanel.isOnline();
        return true;
      })
      .catch(err => {
        this.chatPanel.isOffline();
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
}
