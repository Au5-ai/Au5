export interface Meeting {
  id: string;
  title: string;
  url: string;
  platform: "google" | "zoom" | "teams";
  status: "scheduled" | "active" | "completed" | "cancelled";
  startTime: string;
  endTime?: string;
  participants: number;
  botDisplayName: string;
  language: string;
  settings: MeetingSettings;
}

export interface MeetingSettings {
  videoRecording: boolean;
  audioRecording: boolean;
  transcription: boolean;
  transcriptionModel: string;
}

export interface Transcription {
  id: string;
  meetingId: string;
  content: string;
  timestamp: string;
  speaker?: string;
  confidence: number;
}

export interface BotConfig {
  hubUrl: string;
  platform: string;
  meetingUrl: string;
  botDisplayName: string;
  meetId: string;
  language: string;
  autoLeave: {
    waitingEnter: number;
    noParticipant: number;
    allParticipantsLeft: number;
  };
  meetingSettings: MeetingSettings;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
