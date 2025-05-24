export interface Header {
  Type: string;
}

export interface Message {
  Header: Header;
  Payload: any;
}

/**
 * Actions that can be triggered by the content script.
 */
export enum MessageTypes {
  NotifyRealTimeTranscription = "NotifyRealTimeTranscription",
  NotifyUserJoining = "NotifyUserJoining",
  TriggerTranscriptionStart = "TriggerTranscriptionStart",
  NotifyMeetHasBeenStarted = "NotifyMeetHasBeenStarted",
  ListOfUsersInMeeting = "ListOfUsersInMeeting",
  NotifyUserLeft = "NotifyUserLeft"
}
