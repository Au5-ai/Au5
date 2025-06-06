import { ElementHandle } from "playwright";

export interface MutationContext {
  transcriptContainer?: ElementHandle<HTMLElement> | null;
  canUseAriaBasedTranscriptSelector: boolean;
}

export interface Caption {
  blockId: string;
  speakerName: string;
  pictureUrl: string;
  transcript: string;
}

export interface GoogleDomConfiguration {
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
}
