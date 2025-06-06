"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEETING_CONFIG = exports.BROWSER_ARGS = exports.USER_AGENT = exports.LogMessages = exports.ErrorMessages = void 0;
class ErrorMessages {
}
exports.ErrorMessages = ErrorMessages;
ErrorMessages.MEETING_CONFIG_NOT_SET = "MeetingConfiguration environment variable not set.";
ErrorMessages.INVALID_MEETING_CONFIG_JSON = "Invalid JSON in MeetingConfiguration environment variable.";
ErrorMessages.RUNNING_BOT = "Error running the bot with the provided configuration.";
ErrorMessages.browserCloseError = (err) => `[Program] Error closing browser: ${err}`;
var LogMessages;
(function (LogMessages) {
    LogMessages.Program = {
        browserRequested: "[Program] Browser requested graceful shutdown.",
        shutdownAlreadyInProgress: "[Program] Shutdown already in progress.",
        closingBrowserInstance: "[Program] Closing browser instance.",
    };
})(LogMessages || (exports.LogMessages = LogMessages = {}));
exports.USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
exports.BROWSER_ARGS = [
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
exports.MEETING_CONFIG = `{
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
