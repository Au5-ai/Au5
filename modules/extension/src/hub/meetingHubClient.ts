import * as signalR from "@microsoft/signalr";
import {WindowMessageHandler} from "../core/windowMessageHandler";
import {AppConfiguration, IMessage, JoinMeeting} from "../core/types";
import {MessageTypes, PostMessageSource} from "../core/types/index";

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
      .build();

    this.windowMessageHandler = new WindowMessageHandler(
      PostMessageSource.BackgroundScript,
      PostMessageSource.ContentScript,
      this.handleWindowMessage.bind(this)
    );
  }

  public startConnection(): boolean {
    this.connection
      .start()
      .then(() => {
        this.connection.invoke("JoinMeeting", {
          meetingId: this.meetingId,
          user: {
            token: this.config.user.token,
            id: this.config.user.id,
            fullName: this.config.user.fullName,
            pictureUrl: this.config.user.pictureUrl
          }
        } as JoinMeeting);
      })
      .then(() => {
        this.setupHandlers();
      })
      .catch(err => {
        console.error("SignalR connection failed:", err);
        return false;
      });
    return true;
  }

  private setupHandlers() {
    this.connection.on("ReceiveMessage", (msg: IMessage) => {
      switch (msg.type) {
        case MessageTypes.NotifyUserJoining:
        case MessageTypes.TranscriptionEntry:
        case MessageTypes.ReactionApplied:
          this.windowMessageHandler.postToWindow(msg);
          break;
      }
    });
  }

  private handleWindowMessage(action: string, payload: any) {
    switch (action) {
      case MessageTypes.ReactionApplied:
        this.connection.invoke(action, payload);
        break;
    }
  }
}
