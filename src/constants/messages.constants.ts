export const MESSAGES = {
  NO_WEBHOOK_URL: "No webhook URL configured.",
  WEBHOOK_POSTED: "Webhook successfully posted.",
  NO_MEETING_FOUND: "No meeting found to process.",
  EMPTY_MEETING_DATA: "Meeting data is empty."
} as const;

export type MessageKey = keyof typeof MESSAGES;
