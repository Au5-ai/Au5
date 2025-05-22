export interface UserConfiguration {
  token: string;
  userId: string;
  fullName: string;
  pictureUrl: string;
}

export interface ServiceConfiguration {
  webhookUrl: string;
  direction: "ltr" | "rtl";
  hubUrl: string;
}

export interface ExtensionConfiguration {
  meetingEndIcon: {
    selector: string;
    text: string;
  };
  captionsIcon: {
    selector: string;
    text: string;
  };
  transcriptSelectors: {
    aria: string;
    fallback: string;
  };
  transcriptStyles: {
    opacity: string;
  };
  maxTranscriptLength: number;
  transcriptTrimThreshold: number;
}

export interface AppConfiguration {
  user: UserConfiguration;
  service: ServiceConfiguration;
  extension: ExtensionConfiguration;
}
