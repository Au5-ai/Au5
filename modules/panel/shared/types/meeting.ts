import { Assistant } from "./assistants";
import { Participant, User } from "./user";

export interface MeetingItem {
  meetingId: string;
  meetId: string;
  meetName: string;
  platform: string;
  botName: string;
  status: string;
  duration: string;
  time: string;
  isFavorite: boolean;
  pictureUrl: string;
  guests: string[];
  participants: Participant[];
}

export interface MeetingGroup {
  date: string;
  items: MeetingItem[];
}

export type MeetingData = MeetingGroup[];

export interface Meeting {
  id: string;
  title: string;
  meetingId: string;
  userRecorder: Participant;
  hashToken: string;
  platform: string;
  botName: string;
  isBotAdded: boolean;
  createdAt: string;
  duration: string;
  closedAt: string;
  status: string;
  isFavorite: boolean;
  participants: Array<Participant>;
  guests: Array<Participant>;
  entries: Array<Entry>;
}

export interface Entry {
  blockId: string;
  participantId: string;
  fullName: string;
  pictureUrl: string;
  content: string;
  timestamp: string;
  timeline: string;
  entryType: string;
  reactions: Array<Reaction>;
}

export interface Reaction {
  id: number;
  type: string;
  emoji: string;
  className: string;
  participants: Array<Participant>;
}

export interface AIContent {
  id: string;
  meetingId: string;
  content: string;
  assistant: Assistant;
  user: User;
}
