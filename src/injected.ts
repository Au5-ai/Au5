import * as signalR from "@microsoft/signalr";

(function () {
  const meetingId = getMeetingTitleFromUrl();

  const connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7061/meetinghub")
    .build();

  connection.on("ReceiveMessage", (msg: {id: string; speaker: string; transcript: string; timestamp: string}) => {
    window.postMessage(
      {
        source: "Au5-Extension",
        action: "Transcript",
        payload: msg
      },
      "*"
    );
  });

  connection
    .start()
    .then(() => {
      connection.invoke("JoinMeeting", meetingId);
    })
    .catch(err => {
      console.error("Connection failed:", err);
    });
})();

function getMeetingTitleFromUrl(): string {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const meetingId = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "N/A";
  return meetingId;
}
