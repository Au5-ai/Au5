export const MeetingHubConfig = {
  hubUrl: "https://localhost:7061/meetinghub",
  receiveMethod: "ReceiveMessage",
  messageSources: {
    injectedScript: "Au5-InjectedScript",
    contentScript: "Au5-ContentScript"
  },
  contentScriptActions: {
    TRANSCRIPTION_UPDATE: "RealTimeTranscription",
    PARTICIPANT_JOINED: "SomeoneIsJoining",
    TRANSCRIPTION_STARTED: "StartTranscription"
  },
  injectedScriptActions: {
    SET_MEETING_TITLE: "MeetingTitle",
    REQUEST_TRANSCRIPTION: "StartTranscription",
    SEND_TRANSCRIPTION: "RealTimeTranscription"
  },
  defaultMeetingId: "NA"
};
