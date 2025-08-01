"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BROWSER_ARGS = exports.USER_AGENT = exports.LogMessages = exports.ErrorMessages = void 0;
class ErrorMessages {
}
exports.ErrorMessages = ErrorMessages;
ErrorMessages.MEETING_CONFIG_NOT_SET = "MeetingConfiguration environment variable not set.";
ErrorMessages.INVALID_MEETING_CONFIG_JSON = "Invalid JSON in MeetingConfiguration environment variable.";
ErrorMessages.RUNNING_BOT = "Error running the bot with the provided configuration.";
ErrorMessages.browserCloseError = (err) => `[BotManager] Error closing browser: ${err}`;
var LogMessages;
(function (LogMessages) {
    LogMessages.BotManager = {
        browserRequested: "[BotManager] Browser requested graceful shutdown.",
        shutdownAlreadyInProgress: "[BotManager] Shutdown already in progress.",
        closingBrowserInstance: "[BotManager] Closing browser instance.",
        alreadyInProgress: "[BotManager] Already in progress, ignoring duplicate call.",
        hubClientNotInitialized: "[BotManager] Hub client is not initialized.",
        botSuccessfullyJoined: "[BotManager] Bot successfully joined the meeting on platform",
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
