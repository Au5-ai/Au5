import { GoogleCaptionConfiguration } from "./types";

export const WAIT_FOR_NAME_FIELD_TIMEOUT = 120_000;
export const WAIT_FOR_JOIN_BUTTON_TIMEOUT = 60_000;
export const RANDOM_DELAY_MAX = 1_000;
export const CAPTION_UI_STABILIZATION_DELAY = 2_000;

export const Google_Caption_Configuration = {
  transcriptSelectors: {
    aria: 'div[role="region"][tabindex="0"]',
    fallback: ".a4cQT",
  },
} as GoogleCaptionConfiguration;
