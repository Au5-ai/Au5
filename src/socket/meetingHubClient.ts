import * as signalR from "@microsoft/signalr";
import {AppConfiguration} from "../core/types/configuration";
import {IMessage, JoinMeeting} from "./types";
import {WindowMessageHandler} from "../core/windowMessageHandler";
import {createMeetingPlatformInstance} from "../core/platforms/meetingPlatform";
import {MessageTypes} from "./types/enums";

export class MeetingHubClient {
  private connection: signalR.HubConnection;
  private meetingId: string;
  private config: AppConfiguration;
  private windowMessageHandler: WindowMessageHandler;

  constructor(config: AppConfiguration, meetingId: string) {
    this.config = config;
    this.meetingId = meetingId;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.config.service.hubUrl)
      .withAutomaticReconnect()
      //.withHubProtocol(new MessagePackHubProtocol())
      .build();

    this.windowMessageHandler = new WindowMessageHandler(
      "Au5-MeetingHubClient",
      "Au5-ContentScript",
      this.handleWindowMessage.bind(this)
    );
    this.startConnection();
  }

  private setupHandlers() {
    this.connection.on("ReceiveMessage", (msg: IMessage) => {
      switch (msg.type) {
        case MessageTypes.NotifyUserJoining:
        case MessageTypes.TriggerTranscriptionStart:
        case MessageTypes.NotifyRealTimeTranscription:
        case MessageTypes.ListOfUsersInMeeting:
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

export async function establishConnection(config: AppConfiguration, meetingId: string) {
  const platform = createMeetingPlatformInstance(window.location.href);
  if (!platform) {
    console.error("Unsupported meeting platform");
    return;
  }
  new MeetingHubClient(config, meetingId);
}
