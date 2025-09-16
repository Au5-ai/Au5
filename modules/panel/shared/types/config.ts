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
