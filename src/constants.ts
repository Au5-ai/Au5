export const CONFIG = {
  userName: "Mohammad Karimi",
  meetingEndIcon: {
    selector: ".google-symbols",
    text: "call_end"
  },
  captionsIcon: {
    selector: ".google-symbols",
    text: "closed_caption_off"
  },
  transcriptSelectors: {
    ariaBased: 'div[role="region"][tabindex="0"]',
    fallback: ".a4cQT"
  },
  transcriptStyles: {
    opacity: "0.2"
  },
  reportErrorMessage: "There is a bug in TranscripTonic. Please report it.",
  maxTranscriptLength: 250,
  transcriptTrimThreshold: 125
};
