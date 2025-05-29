import {Platform} from "@microsoft/signalr/dist/esm/Utils";
import {User} from "../../core/types";
import {MessageTypes} from "./enums";

export type HubMessage =
  | UserJoinedInMeetingMessage
  | ListOfUsersInMeetingMessage
  | MeetingStartedMessage
  | TranscriptionEntryMessage;

export interface IMessage {
  readonly type: string;
}

export interface MeetingStartedMessage extends IMessage {
  readonly type: MessageTypes.TriggerTranscriptionStart;
  isStarted: boolean;
}

export interface ListOfUsersInMeetingMessage extends IMessage {
  readonly type: MessageTypes.ListOfUsersInMeeting;
  users: ReadonlyArray<User>;
}

export interface JoinMeeting {
  platform: Platform;
  meetingId: string;
  user: User;
}

export interface StartTranscription extends IMessage {
  readonly type: MessageTypes.TriggerTranscriptionStart;
  meetingId: string;
  userId: string;
}

export interface UserJoinedInMeetingMessage extends IMessage {
  readonly type: MessageTypes.NotifyUserJoining;
  user: User;
}

export interface TranscriptionEntryMessage extends IMessage {
  meetingId: string;
  transcriptionBlockId: string;
  speaker: User;
  transcript: string;
  timestamp: Date;
  readonly type: MessageTypes.NotifyRealTimeTranscription;
}
