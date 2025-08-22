export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  [key: string]: any;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public problemDetails: ProblemDetails
  ) {
    super(problemDetails.detail || title);
    this.name = "ApiError";
  }
}

// Types for API requests and responses
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface User {
  id: string;
  fullName: string;
  pictureUrl?: string;
  hasAccount: boolean;
  email: string;
}

export interface SystemConfig {
  panelUrl: string;
  serviceBaseUrl: string;
  direction: string;
  language: string;
  hubUrl: string;
  organizationName: string;
  botName: string;
}

export interface AppConfig {
  user: {
    id: string;
    fullName: string;
    pictureUrl?: string;
    hasAccount: boolean;
  };
  service: {
    jwtToken: string;
    panelUrl: string;
    baseUrl: string;
    direction: string;
    language: string;
    hubUrl: string;
    companyName: string;
    botName: string;
  };
}

export interface Participant {
  id: string;
  fullName: string;
  pictureUrl: string;
  email: string;
  hasAccount: boolean;
}

export interface MeetingItem {
  meetingId: string;
  meetId: string;
  meetName: string;
  platform: string;
  botName: string;
  status: string;
  duration: string;
  time: string;
  pictureUrl: string;
  guests: string[];
  participants: Participant[];
}

export interface MeetingGroup {
  date: string;
  items: MeetingItem[];
}

export type MeetingData = MeetingGroup[];

export interface SystemSettings {
  OrganizationName: string;
  BotName: string;
  BotFatherUrl: string;
  BotHubUrl: string;
  HubUrl: string;
  ServiceBaseUrl: string;
  PanelUrl: string;
  Direction: string;
  Language: string;
  OpenAIToken: string;
  MeetingTranscriptionModel: string;
  AutoLeaveWaitingEnter: number;
  AutoLeaveNoParticipant: number;
  AutoLeaveAllParticipantsLeft: number;
  MeetingVideoRecording: boolean;
  MeetingAudioRecording: boolean;
  MeetingTranscription: boolean;
}
