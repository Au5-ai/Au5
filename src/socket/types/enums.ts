export enum Platform {
  Zoom = "Zoom",
  Teams = "Teams",
  GoogleMeet = "GoogleMeet"
  // add more platforms as needed
}

/**
 * Actions that can be triggered by the content script.
 */
export enum MessageTypes {
  NotifyRealTimeTranscription = "NotifyRealTimeTranscription",
  NotifyUserJoining = "NotifyUserJoining",
  TriggerTranscriptionStart = "TriggerTranscriptionStart",
  ListOfUsersInMeeting = "ListOfUsersInMeeting",
  ReactionApplied = "ReactionApplied"
}
