import * as signalR from "@microsoft/signalr";
import {AppConfiguration} from "../core/types/configuration";
import {IMessage, JoinMeeting, MessageTypes} from "./types";
import {WindowMessageHandler} from "../core/windowMessageHandler";
import {createMeetingPlatformInstance} from "../core/meetingPlatform";

export class MeetingHubClient {
  private connection: signalR.HubConnection;
  private meetingId: string;
  private platformName: string;
  private config: AppConfiguration;
  private windowMessageHandler: WindowMessageHandler;

  constructor(config: AppConfiguration, meetingId: string, platformName: string) {
    this.config = config;
    this.meetingId = meetingId;
    this.platformName = platformName;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.config.service.hubUrl)
      .withAutomaticReconnect()
      //.withHubProtocol(new MessagePackHubProtocol())
      .build();

    this.windowMessageHandler = new WindowMessageHandler(
      "Au5-ContentScript",
      "Au5-InjectedScript",
      this.handleWindowMessage.bind(this)
    );
    this.startConnection();
  }

  private setupHandlers() {
    this.connection.on("ReceiveMessage", (msg: IMessage) => {
      switch (msg.type) {
        case MessageTypes.NotifyUserJoining:
        case MessageTypes.NotifyMeetHasBeenStarted:
        case MessageTypes.TriggerTranscriptionStart:
        case MessageTypes.NotifyRealTimeTranscription:
        case MessageTypes.ListOfUsersInMeeting:
        case MessageTypes.NotifyUserLeft:
          this.windowMessageHandler.postToWindow(msg);
          break;
      }
    });
  }

  private startConnection() {
    this.connection
      .start()
      .then(() => {
        this.connection.invoke("JoinMeeting", {
          platform: this.platformName,
          meetingId: this.meetingId,
          user: {
            id: this.config.user.userId,
            fullName: this.config.user.fullName,
            pictureUrl: this.config.user.pictureUrl,
            joinedAt: new Date()
          }
        } as JoinMeeting);
      })
      .then(() => {
        this.setupHandlers();
      })
      .catch(err => {
        console.error("SignalR connection failed:", err);
      });
  }

  private handleWindowMessage(action: string, payload: any) {
    switch (action) {
      case MessageTypes.TriggerTranscriptionStart:
      case MessageTypes.NotifyRealTimeTranscription:
        this.connection.invoke(action, payload);
        break;
    }
  }
}

export async function establishConnection(config: AppConfiguration, meetingId: string, platformName: string) {
  const platform = createMeetingPlatformInstance(window.location.href);
  if (!platform) {
    console.error("Unsupported meeting platform");
    return;
  }
  new MeetingHubClient(config, meetingId, platformName);
}
