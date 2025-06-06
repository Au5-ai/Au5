export class ErrorMessages {
  static readonly MEETING_CONFIG_NOT_SET =
    "MeetingConfiguration environment variable not set.";
  static readonly INVALID_MEETING_CONFIG_JSON =
    "Invalid JSON in MeetingConfiguration environment variable.";
  static readonly RUNNING_BOT =
    "Error running the bot with the provided configuration.";
  static browserCloseError = (err: unknown): string =>
    `[Program] Error closing browser: ${err}`;
}

export namespace LogMessages {
  export const Program = {
    browserRequested: "[Program] Browser requested graceful shutdown.",
    shutdownAlreadyInProgress: "[Program] Shutdown already in progress.",
    closingBrowserInstance: "[Program] Closing browser instance.",
  } as const;
}

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

export const BROWSER_ARGS: string[] = [
  "--incognito",
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-features=IsolateOrigins,site-per-process",
  "--disable-infobars",
  "--disable-gpu",
  "--use-fake-ui-for-media-stream",
  "--use-file-for-fake-video-capture=/dev/null",
  "--use-file-for-fake-audio-capture=/dev/null",
  "--allow-running-insecure-content",
];

export const MEETING_CONFIG = `{
  "hubUrl": "http://172.22.208.1:1366/meetinghub",
  "platform": "googleMeet",
  "meetingUrl": "https://meet.google.com/kqt-byur-jya",
  "model": "liveCaption",
  "botDisplayName": "Au5Bot",
  "meetingId": "kqt-byur-jya",
  "language": "fa-IR",
  "autoLeave": {
    "waitingEnter": 30000,
    "noParticipant": 60000,
    "allParticipantsLeft": 120000
  }
}`;
