export enum InjectedScriptAllowedActions {
  NotifyRealTimeTranscription = "NotifyRealTimeTranscription",
  NotifyUserJoining = "NotifyUserJoining",
  TriggerTranscriptionStart = "TriggerTranscriptionStart",
  NotifyMeetHasBeenStarted = "NotifyMeetHasBeenStarted"
}

export enum PostMessageTypes {
  ContentScript = "Au5-ContentScript",
  BackgroundScript = "Au5-BackgroundScript",
  MeetingHubClient = "Au5-MeetingHubClient"
}
