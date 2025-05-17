// import * as signalR from "@microsoft/signalr";
// import {getMeetingTitleFromUrl} from "./utils/urlHelper";

// export const HubConnectionConfig = {
//   hubUrl: "https://localhost:7061/meetinghub",
//   methodName: "ReceiveMessage",
//   toContentScript: {
//     source: "Au5-InjectedScript",
//     actions: {
//       realTimeTranscription: "RealTimeTranscription",
//       someoneIsJoining: "SomeoneIsJoining",
//       startTranscription: "StartTranscription"
//     }
//   },
//   fromContentScropt: {
//     source: "Au5-ContentScript",
//     actions: {
//       meetingTitle: "MeetingTitle",
//       startTranscription: "StartTranscription",
//       realTimeTranscription: "RealTimeTranscription"
//     }
//   },
//   meetingId: "NA"
// };

// (function () {
//   let connection: signalR.HubConnection;

//   function initializeConnection(meetingId: string) {
//     connection = new signalR.HubConnectionBuilder().withUrl(HubConnectionConfig.hubUrl).build();
//     connection.on(
//       HubConnectionConfig.methodName,
//       (msg: {
//         header: {messageType: string};
//         payload: {id: string; speaker: string; transcript: string; timestamp: string};
//       }) => {
//         if (msg.header.messageType === "SomeoneIsJoining") {
//           window.postMessage(
//             {
//               source: HubConnectionConfig.toContentScript.source,
//               action: HubConnectionConfig.toContentScript.actions.someoneIsJoining,
//               payload: msg.payload
//             },
//             "*"
//           );
//           return;
//         }
//         if (msg.header.messageType === "RealTimeTranscription") {
//           window.postMessage(
//             {
//               source: HubConnectionConfig.toContentScript.source,
//               action: HubConnectionConfig.toContentScript.actions.realTimeTranscription,
//               payload: msg.payload
//             },
//             "*"
//           );
//         }

//         if (msg.header.messageType === "StartTranscription") {
//           window.postMessage(
//             {
//               source: HubConnectionConfig.toContentScript.source,
//               action: HubConnectionConfig.toContentScript.actions.startTranscription,
//               payload: msg.payload
//             },
//             "*"
//           );
//         }
//       }
//     );

//     function startConnection() {
//       connection
//         .start()
//         .then(() => {
//           connection.invoke("JoinMeeting", meetingId, "123456", "John Doe");
//         })
//         .catch(err => {
//           setTimeout(startConnection, 3000);
//         });
//     }

//     connection.onclose(() => {
//       startConnection();
//     });

//     startConnection();
//   }

//   window.addEventListener("message", event => {
//     if (event.source !== window || event.data.source !== HubConnectionConfig.fromContentScropt.source) {
//       return;
//     }

//     if (event.data.action === HubConnectionConfig.fromContentScropt.actions.startTranscription) {
//       connection.invoke(
//         HubConnectionConfig.fromContentScropt.actions.startTranscription,
//         HubConnectionConfig.meetingId,
//         event.data.payload.userId
//       );
//     }

//     if (event.data.action === HubConnectionConfig.fromContentScropt.actions.realTimeTranscription) {
//       connection.invoke(
//         HubConnectionConfig.fromContentScropt.actions.realTimeTranscription,
//         HubConnectionConfig.meetingId,
//         event.data.payload.id,
//         event.data.payload.speaker,
//         event.data.payload.transcript
//       );
//     }
//   });

//   HubConnectionConfig.meetingId = getMeetingTitleFromUrl();
//   initializeConnection(HubConnectionConfig.meetingId);
// })();
import * as signalR from "@microsoft/signalr";
import {getMeetingTitleFromUrl} from "./utils/urlHelper";

// Enums for message actions
enum ContentScriptActions {
  RealTimeTranscription = "RealTimeTranscription",
  SomeoneIsJoining = "SomeoneIsJoining",
  StartTranscription = "StartTranscription",
  MeetingTitle = "MeetingTitle"
}

enum MessageSource {
  InjectedScript = "Au5-InjectedScript",
  ContentScript = "Au5-ContentScript"
}

// Types
interface MessageHeader {
  messageType: string;
}

interface MessagePayload {
  id: string;
  speaker: string;
  transcript: string;
  timestamp: string;
}

interface Message {
  header: MessageHeader;
  payload: MessagePayload;
}

// Config object
export const HubConnectionConfig = {
  hubUrl: "https://localhost:7061/meetinghub",
  methodName: "ReceiveMessage",
  meetingId: "NA"
};

class MeetingHubClient {
  private connection: signalR.HubConnection;
  private meetingId: string;

  constructor(meetingId: string) {
    this.meetingId = meetingId;
    this.connection = new signalR.HubConnectionBuilder().withUrl(HubConnectionConfig.hubUrl).build();
    this.setupHandlers();
    this.setupWindowMessageListener();
    this.startConnection();
  }

  private setupHandlers() {
    this.connection.on(HubConnectionConfig.methodName, (msg: Message) => {
      switch (msg.header.messageType) {
        case ContentScriptActions.SomeoneIsJoining:
        case ContentScriptActions.RealTimeTranscription:
        case ContentScriptActions.StartTranscription:
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
        this.connection.invoke("JoinMeeting", this.meetingId, "123456", "John Doe");
      })
      .catch(() => {
        setTimeout(() => this.startConnection(), 3000);
      });
  }

  private setupWindowMessageListener() {
    window.addEventListener("message", event => {
      if (event.source !== window || event.data.source !== MessageSource.ContentScript) return;

      const {action, payload} = event.data;

      switch (action) {
        case ContentScriptActions.StartTranscription:
          this.connection.invoke(action, this.meetingId, payload.userId);
          break;

        case ContentScriptActions.RealTimeTranscription:
          this.connection.invoke(action, this.meetingId, payload.id, payload.speaker, payload.transcript);
          break;
      }
    });
  }
}

// Initialize
(function () {
  HubConnectionConfig.meetingId = getMeetingTitleFromUrl();
  new MeetingHubClient(HubConnectionConfig.meetingId);
})();
