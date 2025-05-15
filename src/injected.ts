import * as signalR from "@microsoft/signalr";
import {HubConnectionConfig} from "./core/constants";
import {getMeetingTitleFromUrl} from "./utils/urlHelper";

(function () {
  let connection: signalR.HubConnection;

  function initializeConnection(meetingId: string) {
    connection = new signalR.HubConnectionBuilder().withUrl(HubConnectionConfig.hubUrl).build();
    connection.on(
      HubConnectionConfig.methodName,
      (msg: {
        header: {messageType: string};
        payload: {id: string; speaker: string; transcript: string; timestamp: string};
      }) => {
        if (msg.header.messageType === "SomeoneIsJoining") {
          window.postMessage(
            {
              source: HubConnectionConfig.toContentScript.source,
              action: HubConnectionConfig.toContentScript.actions.someoneIsJoining,
              payload: msg.payload
            },
            "*"
          );
          return;
        }
        if (msg.header.messageType === "RealTimeTranscription") {
          window.postMessage(
            {
              source: HubConnectionConfig.toContentScript.source,
              action: HubConnectionConfig.toContentScript.actions.realTimeTranscription,
              payload: msg.payload
            },
            "*"
          );
        }

        if (msg.header.messageType === "StartTranscription") {
          window.postMessage(
            {
              source: HubConnectionConfig.toContentScript.source,
              action: HubConnectionConfig.toContentScript.actions.startTranscription,
              payload: msg.payload
            },
            "*"
          );
        }
      }
    );

    function startConnection() {
      connection
        .start()
        .then(() => {
          connection.invoke("JoinMeeting", meetingId);
        })
        .catch(err => {
          setTimeout(startConnection, 3000);
        });
    }

    connection.onclose(() => {
      startConnection();
    });

    startConnection();
  }

  window.addEventListener("message", event => {
    if (event.source !== window || event.data.source !== HubConnectionConfig.fromContentScropt.source) {
      return;
    }

    // if (event.data.action === HubConnectionConfig.fromContentScropt.actions.meetingTitle) {
    //   HubConnectionConfig.meetingId = event.data.payload;
    //   if (connection) {
    //     connection.stop().then(() => initializeConnection(HubConnectionConfig.meetingId));
    //   } else {
    //     initializeConnection(HubConnectionConfig.meetingId);
    //   }
    // } else

    if (event.data.action === HubConnectionConfig.fromContentScropt.actions.startTranscription) {
      connection.invoke(HubConnectionConfig.fromContentScropt.actions.startTranscription, event.data.payload);
    }
  });

  HubConnectionConfig.meetingId = getMeetingTitleFromUrl();
  initializeConnection(HubConnectionConfig.meetingId);
})();
