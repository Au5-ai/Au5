export const platformRegex = {
  googleMeet: /https:\/\/meet\.google\.com\/([a-zA-Z0-9]{3}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{3})/
};

export interface IMeetingPlatform {
  getPlatformName(): string;
  getMeetingId(): string;
}

export interface Speaker {
  fullName: string;
  pictureUrl: string;
}

export interface Entry {
  meetingId?: string;
  blockId: string;
  speaker: User;
  content: string;
  timestamp: Date;
  entryType: "Transcription" | "Chat";
}

export interface User extends Speaker {
  id: string;
}

export interface ServiceIntegration {
  panelUrl: string;
  baseUrl: string;
  direction: "ltr" | "rtl";
  hubUrl: string;
  companyName: string;
  botName: string;
}

export interface AppConfiguration {
  user: User;
  service: ServiceIntegration;
}

export interface IMessage {
  readonly type: string;
}

export interface UserJoinedInMeetingMessage extends IMessage {
  readonly type: MessageTypes.UserJoinedInMeeting;
  meetingId: string;
  user: User;
  platform: string;
}

export interface RequestToAddBotMessage extends IMessage {
  readonly type: MessageTypes.RequestToAddBot;
  meetingId: string;
  botName: string;
  user: User;
}

export interface BotJoinedInMeetingMessage extends IMessage {
  readonly type: MessageTypes.BotJoinedInMeeting;
  meetingId: string;
  botName: string;
}

export interface EntryMessage extends Entry, IMessage {
  readonly type: MessageTypes.Entry;
}

export interface ReactionAppliedMessage extends IMessage {
  readonly type: MessageTypes.ReactionApplied;
  meetingId?: string;
  blockId: string;
  user: User;
  reactionType: string;
}

export interface PauseAndPlayTranscriptionMessage extends IMessage {
  readonly type: MessageTypes.PauseAndPlayTranscription;
  meetingId: string;
  user: User;
  isPaused: boolean;
}

export interface MeetingIsActiveMessage extends IMessage {
  readonly type: MessageTypes.MeetingIsActive;
  meetingId: string;
  botName: string;
}

export enum PostMessageSource {
  ContentScript = "Au5-ContentScript",
  BackgroundScript = "Au5-BackgroundScript"
}

/**
 * Actions that can be triggered by the content script.
 */
export enum MessageTypes {
  UserJoinedInMeeting = "UserJoinedInMeeting",
  BotJoinedInMeeting = "BotJoinedInMeeting",
  Entry = "Entry",
  ReactionApplied = "ReactionApplied",
  GeneralMessage = "GeneralMessage",
  RequestToAddBot = "RequestToAddBot",
  PauseAndPlayTranscription = "PauseAndPlayTranscription",
  MeetingIsActive = "MeetingIsActive"
}

export interface RequestAddBotModel {
  meetingId: string;
  botName: string;
  user: User;
}
