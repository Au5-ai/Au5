const xhr = new XMLHttpRequest();
xhr.open("POST", "http://localhost:1366/meeting/bot", true);
xhr.setRequestHeader("Content-Type", "application/json");

const data = JSON.stringify({
  MeetingId: "kqt-byur-jya",
  BotName: "BotNameHere",
  User: {
    Id: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
    FullName: "Mohammad Karimi",
  }
});

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    console.log("Response:", xhr.responseText);
  }
};

xhr.send(data);


