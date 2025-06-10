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
  token: string;
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
