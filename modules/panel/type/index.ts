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

export interface HelloAdminResponse {
  helloFromAdmin: boolean;
}

export interface AddAdminRequest {
  email: string;
  fullName: string;
  password: string;
  repeatedPassword: string;
}

export interface AddAdminResponse {
  isDone: boolean;
}

export interface ExtensionConfig {
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

export interface SystemConfigs {
  organizationName: string;
  botName: string;
  botFatherUrl: string;
  botHubUrl: string;
  hubUrl: string;
  serviceBaseUrl: string;
  panelUrl: string;
  direction: string;
  language: string;
  openAIToken: string;
  meetingTranscriptionModel: string;
  autoLeaveWaitingEnter: number;
  autoLeaveNoParticipant: number;
  autoLeaveAllParticipantsLeft: number;
  meetingVideoRecording: boolean;
  meetingAudioRecording: boolean;
  meetingTranscription: boolean;
}

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
