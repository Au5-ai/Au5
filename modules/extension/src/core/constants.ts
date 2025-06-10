export enum InjectedScriptAllowedActions {
  NotifyRealTimeTranscription = "NotifyRealTimeTranscription",
  NotifyUserJoining = "NotifyUserJoining"
}

export enum PostMessageSource {
  ContentScript = "Au5-ContentScript",
  BackgroundScript = "Au5-BackgroundScript",
  MeetingHubClient = "Au5-MeetingHubClient"
}

/**
 * Actions that can be triggered by the content script.
 */
export enum MessageTypes {
  NotifyRealTimeTranscription = "NotifyRealTimeTranscription",
  NotifyUserJoining = "NotifyUserJoining",
  ReactionApplied = "ReactionApplied"
}
