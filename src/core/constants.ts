export const MeetingHubConfig = {
  hubUrl: "https://localhost:7061/meetinghub",
  receiveMethod: "ReceiveMessage"
};

export const PostMessageConfig = {
  messageSources: {
    injectedScript: "Au5-InjectedScript",
    contentScript: "Au5-ContentScript"
  },
  contentScriptActions: {
    TRANSCRIPTION_UPDATE: "RealTimeTranscription",
    PARTICIPANT_JOINED: "SomeoneIsJoining",
    TRANSCRIPTION_STARTED: "StartTranscription",
    MEET_HASBEEN_STARTED: "MeetHasBeenStarted"
  },
  injectedScriptActions: {
    REQUEST_TRANSCRIPTION: "StartTranscription",
    SEND_TRANSCRIPTION: "RealTimeTranscription"
  }
};
