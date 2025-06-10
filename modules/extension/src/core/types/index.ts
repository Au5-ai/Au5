import {MessageTypes} from "../constants";

export interface Speaker {
  fullName: string;
  pictureUrl: string;
}

export interface TranscriptionEntry {
  meetingId: string;
  transcriptBlockId: string;
  speaker: Speaker;
  transcript: string;
  timestamp: Date;
}

export interface User {
  token?: string | null;
  id: string;
  fullName: string;
  pictureUrl: string;
}

export interface ServiceIntegration {
  webhookUrl: string;
  direction: "ltr" | "rtl";
  hubUrl: string;
  companyName: string;
}

export interface AppConfiguration {
  user: User;
  service: ServiceIntegration;
}

export interface IMessage {
  readonly type: string;
}

export interface JoinMeeting {
  meetingId: string;
  user: User;
}

export interface ReactionAppliedMessage extends IMessage {
  readonly type: MessageTypes.ReactionApplied;
  meetingId: string;
  transcriptBlockId: string;
  user: User;
  reaction: string;
}

export interface IMeetingPlatform {
  getPlatformName(): string;
  getMeetingId(): string;
}

export interface UserJoinedInMeetingMessage extends IMessage {
  readonly type: MessageTypes.NotifyUserJoining;
  user: User;
}

export interface TranscriptionEntryMessage extends IMessage {
  meetingId: string;
  transcriptBlockId: string;
  speaker: User;
  transcript: string;
  timestamp: Date;
  readonly type: MessageTypes.TranscriptionEntryMessage;
}
