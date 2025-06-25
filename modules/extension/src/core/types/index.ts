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
  speaker: Speaker;
  content: string;
  timestamp: Date;
  entryType: "Transcription" | "Chat";
}

export interface User extends Speaker {
  token?: string | null;
  id?: string;
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
  meetingId?: string;
  transcriptBlockId: string;
  user: User;
  reactionType: string;
}

export interface BotJoinedInMeetingMessage extends IMessage {
  readonly type: MessageTypes.BotJoinedInMeeting;
  meetingId: string;
  botName: string;
}

export interface UserJoinedInMeetingMessage extends IMessage {
  readonly type: MessageTypes.UserJoinedInMeeting;
  user: User;
}

export interface EntryMessage extends Entry, IMessage {
  readonly type: MessageTypes.Entry;
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
  RequestToAddBot = "RequestToAddBot"
}
