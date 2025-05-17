export const HubConnectionConfig = {
  hubUrl: "https://localhost:7061/meetinghub",
  methodName: "ReceiveMessage",
  toContentScript: {
    source: "Au5-InjectedScript",
    actions: {
      realTimeTranscription: "RealTimeTranscription",
      someoneIsJoining: "SomeoneIsJoining",
      startTranscription: "StartTranscription"
    }
  },
  fromContentScropt: {
    source: "Au5-ContentScript",
    actions: {
      meetingTitle: "MeetingTitle",
      startTranscription: "StartTranscription",
      realTimeTranscription: "RealTimeTranscription"
    }
  },
  meetingId: "NA"
};
