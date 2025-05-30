import * as signalR from "@microsoft/signalr";
import {AppConfiguration} from "../core/types/configuration";
import {IMessage, JoinMeeting} from "./types";
import {WindowMessageHandler} from "../core/windowMessageHandler";
import {MessageTypes} from "./types/enums";
import {IMeetingPlatform} from "../core/types";
import {PostMessageTypes} from "../core/constants";

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
      PostMessageTypes.MeetingHubClient,
      PostMessageTypes.ContentScript,
      this.handleWindowMessage.bind(this)
    );
  }

  public startConnection() {
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

  private setupHandlers() {
    this.connection.on("ReceiveMessage", (msg: IMessage) => {
      switch (msg.type) {
        case MessageTypes.NotifyUserJoining:
        case MessageTypes.TriggerTranscriptionStart:
        case MessageTypes.NotifyRealTimeTranscription:
        case MessageTypes.ListOfUsersInMeeting:
        case MessageTypes.ReactionApplied:
          this.windowMessageHandler.postToWindow(msg);
          break;
      }
    });
  }

  private handleWindowMessage(action: string, payload: any) {
    switch (action) {
      case MessageTypes.TriggerTranscriptionStart:
      case MessageTypes.NotifyRealTimeTranscription:
      case MessageTypes.ReactionApplied:
        this.connection.invoke(action, payload);
        break;
    }
  }
}
