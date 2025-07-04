// Enums
export enum MessageTypes {
  TranscriptionEntry = "TranscriptionEntry",
  NotifyUserJoining = "NotifyUserJoining",
  ReactionApplied = "ReactionApplied",
}

// Base Interfaces
export interface IMessage {
  readonly type: string;
}

// Message Interfaces
export interface ReactionAppliedMessage extends IMessage {
  readonly type: MessageTypes.ReactionApplied;
  meetingId?: string;
  transcriptBlockId: string;
  user: User;
  reactionType: string;
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
  readonly type: MessageTypes.TranscriptionEntry;
}

// Domain Interfaces
export interface JoinMeeting {
  meetingId: string;
  user: User;
}

export interface TranscriptionEntry {
  meetingId?: string;
  transcriptBlockId: string;
  speaker: Speaker;
  transcript: string;
  timestamp: Date;
}

// Entity Interfaces
export interface Speaker {
  fullName: string;
  pictureUrl: string;
}

export interface User extends Speaker {
  token?: string | null;
  id?: string;
}
