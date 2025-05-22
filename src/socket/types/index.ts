export interface Header {
  type: string;
}

export interface Message {
  header: Header;
  payload: any;
}

//---------------------------------------
// Enums for message actions
enum ContentScriptActions {
  RealTimeTranscription = "RealTimeTranscription",
  SomeoneIsJoining = "SomeoneIsJoining",
  StartTranscription = "StartTranscription",
  MeetHasBeenStarted = "MeetHasBeenStarted"
}

enum MessageSource {
  InjectedScript = "Au5-InjectedScript",
  ContentScript = "Au5-ContentScript"
}

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
