export const MESSAGES = {
  Error: {
    NO_WEBHOOK_URL: "No webhook URL configured",
    NO_MEETING_FOUND: "No meetings found. Maybe attend one?",
    EMPTY_MEETING_DATA: "Empty transcript and chatMessages",
    WEBHOOK_FAILED: "Webhook failed"
  },
  Info: {
    WEBHOOK_POSTED: "Webhook posted"
  }
};

export const HubConnectionConfig = {
  hubUrl: "https://localhost:7061/meetinghub",
  methodName: "ReceiveMessage",
  toContentScript: {
    source: "Au5-InjectedScript",
    actions: {
      realTimeTranscription: "RealTimeTranscription",
      someoneIsJoining: "SomeoneIsJoining"
    }
  },
  fromContentScropt: {
    source: "Au5-ContentScript",
    actions: {meetingTitle: "MeetingTitle", startTranscription: "StartTranscription"}
  },
  meetingId: "NA"
};
