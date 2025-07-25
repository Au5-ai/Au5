export const platformRegex = {
  googleMeet: /https:\/\/meet\.google\.com\/([a-zA-Z0-9]{3}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{3})/
};

export interface IMeetingPlatform {
  getPlatformName(): string;
  getMeetId(): string;
}

export interface Entry {
  meetId?: string;
  blockId: string;
  participant: Participant;
  content: string;
  timestamp: Date;
  entryType: "Transcription" | "Chat";
}

export interface Participant {
  id: string;
  fullName: string;
  pictureUrl: string;
  hasAccount: boolean;
}

export interface ServiceIntegration {
  panelUrl: string;
  baseUrl: string;
  direction: "ltr" | "rtl";
  language: string;
  hubUrl: string;
  companyName: string;
  botName: string;
  jwtToken: string;
}

export interface AppConfiguration {
  user: Participant;
  service: ServiceIntegration;
}

export interface IMessage {
  readonly type: string;
}

export interface UserJoinedInMeetingMessage extends IMessage {
  readonly type: MessageTypes.UserJoinedInMeeting;
  meetId: string;
  user: Participant;
  platform: string;
}

export interface RequestToAddBotMessage extends IMessage {
  readonly type: MessageTypes.RequestToAddBot;
  meetId: string;
  botName: string;
  user: Participant;
}

export interface BotJoinedInMeetingMessage extends IMessage {
  readonly type: MessageTypes.BotJoinedInMeeting;
  meetId: string;
  botName: string;
}

export interface EntryMessage extends Entry, IMessage {
  readonly type: MessageTypes.Entry;
}

export interface ReactionAppliedMessage extends IMessage {
  readonly type: MessageTypes.ReactionApplied;
  meetId?: string;
  blockId: string;
  user: Participant;
  reactionId: number;
  reactionType: string;
}

export interface PauseAndPlayTranscriptionMessage extends IMessage {
  readonly type: MessageTypes.PauseAndPlayTranscription;
  meetId: string;
  user: Participant;
  isPaused: boolean;
}

export interface MeetingIsActiveMessage extends IMessage {
  readonly type: MessageTypes.MeetingIsActive;
  meetId: string;
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

export interface Reaction {
  id: number;
  type: string;
  emoji: string;
  className: string;
}

export enum PageState {
  ActiveMeeting = "activeMeeting",
  ActiveMeetingButNotStarted = "activeMeetingButNotStarted",
  NoActiveMeeting = "noActiveMeeting",
  UserUnAuthorized = "userUnAuthorized"
}

export interface GLobalState {
  isConnected: boolean;
  page: PageState;
  isBotAdded: boolean;
  isTranscriptionPaused: boolean;
  isBotContainerVisible: boolean;
  theme: "light" | "dark";
}
