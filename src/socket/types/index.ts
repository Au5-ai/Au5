export interface Header {
  type: string;
}

export interface Message {
  header: Header;
  payload: any;
}

/**
 * Actions that can be triggered by the content script.
 */
export enum InjectedScriptAllowedActions {
  NotifyRealTimeTranscription = "NotifyRealTimeTranscription",
  NotifyUserJoining = "NotifyUserJoining",
  TriggerTranscriptionStart = "TriggerTranscriptionStart",
  NotifyMeetHasBeenStarted = "NotifyMeetHasBeenStarted",
  ListOfUsersInMeeting = "ListOfUsersInMeeting",
  NotifyUserLeft = "NotifyUserLeft"
}
