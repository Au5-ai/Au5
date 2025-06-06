import { GoogleDomConfiguration } from "./types";

export const Google_Dom_Configuration = {
  meetingEndIcon: {
    selector: ".google-symbols",
    text: "call_end",
  },
  captionsIcon: {
    selector: ".google-symbols",
    text: "closed_caption_off",
  },
  transcriptSelectors: {
    aria: 'div[role="region"][tabindex="0"]',
    fallback: ".a4cQT",
  },
} as GoogleDomConfiguration;
