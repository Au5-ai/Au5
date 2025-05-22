import * as signalR from "@microsoft/signalr";
import {MessagePackHubProtocol} from "@microsoft/signalr-protocol-msgpack";
import {createMeetingPlatformInstance} from "../core/meetingPlatform";

class MeetingHubClient {
  private connection: signalR.HubConnection;
  private meetingId: string;

  constructor(meetingId: string) {
    this.meetingId = meetingId;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HubConnectionConfig.hubUrl)
      .withAutomaticReconnect()
      .withHubProtocol(new MessagePackHubProtocol())
      .build();

    this.setupHandlers();
    this.setupWindowMessageListener();
    this.startConnection();
  }

  private setupHandlers() {
    this.connection.on(HubConnectionConfig.methodName, (msg: Message) => {
      console.log("Received message from server", msg);
      switch (msg.header.messageType) {
        case ContentScriptActions.SomeoneIsJoining:
        case ContentScriptActions.RealTimeTranscription:
        case ContentScriptActions.StartTranscription:
        case ContentScriptActions.MeetHasBeenStarted:
          this.postToWindow(msg.header.messageType, msg.payload);
          break;
      }
    });

    this.connection.onclose(() => {
      this.startConnection();
    });
  }

  private postToWindow(action: string, payload: MessagePayload) {
    window.postMessage(
      {
        source: MessageSource.InjectedScript,
        action,
        payload
      },
      "*"
    );
  }

  private startConnection() {
    this.connection
      .start()
      .then(() => {
        console.log("Connection started", this.meetingId);
        this.connection.invoke("JoinMeeting", {
          MeetingId: this.meetingId,
          UserId: "123456",
          FullName: "Mohammad Karimi",
          ProfileImage:
            "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
        } as JoinMeetingDto);
      })
      .catch(() => {});
  }

  private setupWindowMessageListener() {
    window.addEventListener("message", event => {
      if (event.source !== window || event.data.source !== MessageSource.ContentScript) return;

      const {action, payload} = event.data;

      switch (action) {
        case ContentScriptActions.StartTranscription:
          this.connection.invoke(action, {MeetingId: this.meetingId, UserId: payload.userId} as StartTranscriptionDto);
          break;

        case ContentScriptActions.RealTimeTranscription:
          this.connection.invoke(action, {
            Id: payload.id,
            MeetingId: this.meetingId,
            Speaker: payload.speaker,
            Transcript: payload.transcript
          } as RealTimeTranscriptionDto);
          break;
      }
    });
  }
}

// Initialize
(function () {
  createMeetingPlatformInstance(window.location.href);
  const meetingId = getMeetingTitleFromUrl(window.location.href);
  new MeetingHubClient(meetingId);
})();
