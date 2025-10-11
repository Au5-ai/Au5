export interface AppConfig {
  user: {
    id: string;
    fullName: string;
    pictureUrl?: string;
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

export interface SystemConfigs {
  organizationName: string;
  botName: string;
  botFatherUrl: string;
  botHubUrl: string;
  hubUrl: string;
  serviceBaseUrl: string;
  aiProviderUrl: string;
  panelUrl: string;
  direction: string;
  language: string;
  openAIToken: string;
  openAIProxyUrl: string;
  llmModel: string;
  meetingTranscriptionModel: string;
  autoLeaveWaitingEnter: number;
  autoLeaveNoParticipant: number;
  autoLeaveAllParticipantsLeft: number;
  meetingVideoRecording: boolean;
  meetingAudioRecording: boolean;
  meetingTranscription: boolean;
  smtpUseSSl: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
}
