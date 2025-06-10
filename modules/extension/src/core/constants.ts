export enum PostMessageSource {
  ContentScript = "Au5-ContentScript",
  BackgroundScript = "Au5-BackgroundScript"
}

/**
 * Actions that can be triggered by the content script.
 */
export enum MessageTypes {
  TranscriptionEntryMessage = "TranscriptionEntryMessage",
  NotifyUserJoining = "NotifyUserJoining",
  ReactionApplied = "ReactionApplied"
}
