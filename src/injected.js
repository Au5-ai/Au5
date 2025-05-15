(function () {
  const meetingId = getMeetingTitleFromUrl();
  const name = "Mohammad Karimi";

  const connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:7061/meetinghub").build();

  connection.on("ReceiveMessage", msg => {
    console.log("Message received:", msg);
    addMessage(msg.sender, msg.text, msg.timestamp);
  });

  connection.start().then(() => {
    connection.invoke("JoinMeeting", meetingId);
    console.log(`Joined ${meetingId} as ${name}`);
  });

  function addMessage(sender, text, timestamp) {
    const div = document.createElement("div");
    div.innerText = `[${timestamp}] ${sender}: ${text}`;
    document.body.appendChild(div);
  }
})();

function getMeetingTitleFromUrl() {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const meetingId = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "N/A";
  return meetingId;
}
