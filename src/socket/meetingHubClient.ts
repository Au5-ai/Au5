import * as signalR from "@microsoft/signalr";
import {MessagePackHubProtocol} from "@microsoft/signalr-protocol-msgpack";
import {createMeetingPlatformInstance} from "../core/meetingPlatform";
import {ConfigurationManager} from "../core/configurationManager";
import {AppConfiguration} from "../core/types/configuration";
import {detectBrowser} from "../core/browser/browserDetector";
import {InjectedScriptAllowedActions, Message} from "./types";
import {WindowMessageHandler} from "./windowMessageHandler";

class MeetingHubClient {
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
      .withHubProtocol(new MessagePackHubProtocol())
      .build();

    this.windowMessageHandler = new WindowMessageHandler(this.handleWindowMessage.bind(this));
    this.setupHandlers();
    this.startConnection();
  }

  private setupHandlers() {
    this.connection.on("ReceiveMessage", (msg: Message) => {
      switch (msg.header.type) {
        case InjectedScriptAllowedActions.NotifyUserJoining:
        case InjectedScriptAllowedActions.NotifyMeetHasBeenStarted:
        case InjectedScriptAllowedActions.TriggerTranscriptionStart:
        case InjectedScriptAllowedActions.NotifyRealTimeTranscription:
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
          MeetingId: this.meetingId,
          User: {
            UserId: this.config.user.userId,
            FullName: this.config.user.fullName,
            PictureUrl: this.config.user.pictureUrl
          }
        });
      })
      .catch(err => {
        console.error("SignalR connection failed:", err);
      });
  }

  private handleWindowMessage(action: string, payload: any) {
    switch (action) {
      case InjectedScriptAllowedActions.TriggerTranscriptionStart:
        this.connection.invoke(action, {
          MeetingId: this.meetingId,
          User: {
            UserId: this.config.user.userId,
            FullName: this.config.user.fullName,
            PictureUrl: this.config.user.pictureUrl
          }
        });
        break;

      case InjectedScriptAllowedActions.NotifyRealTimeTranscription:
        this.connection.invoke(action, {
          MeetingId: this.meetingId,
          Speaker: {
            FullName: payload.fullName,
            PictureUrl: payload.pictureUrl
          },
          Transcript: payload.transcript
        });
        break;
    }
  }
}

// Initialize
(async function () {
  const browser = detectBrowser();
  const configurationManager = new ConfigurationManager(browser);
  const config = await configurationManager.getConfig();

  const platform = createMeetingPlatformInstance(window.location.href);
  if (!platform) {
    console.error("Unsupported meeting platform");
    return;
  }
  const meetingId = platform.getMeetingTitle();
  new MeetingHubClient(config, meetingId);
})();
