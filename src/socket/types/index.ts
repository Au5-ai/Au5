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
  NotifyMeetHasBeenStarted = "NotifyMeetHasBeenStarted"
}

//---------------------------------------

interface StartTranscriptionDto {
  MeetingId: string;
  UserId: string;
}

interface RealTimeTranscriptionDto {
  MeetingId: string;
  Id: string;
  Speaker: string;
  Transcript: string;
}

interface JoinMeetingDto {
  MeetingId: string;
  UserId: string;
  FullName: string;
  ProfileImage: string;
}
