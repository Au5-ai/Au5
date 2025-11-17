export interface AppConfig {
  user: {
    id: string;
    fullName: string;
    pictureUrl?: string;
  };
  service: {
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
  direction: string;
  language: string;
}
