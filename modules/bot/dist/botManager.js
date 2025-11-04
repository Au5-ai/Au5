"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewBotToMeeting = addNewBotToMeeting;
const logger_1 = require("./common/utils/logger");
const constants_1 = require("./common/constants");
const meetingHubClient_1 = require("./hub/meetingHubClient");
const platformFactory_1 = require("./platforms/platformFactory");
const browserSetup_1 = require("./common/browserSetup");
const shutdownManager_1 = require("./common/shutdownManager");
const state = {
    browser: null,
    platform: null,
    hubClient: null,
    config: null,
    isPaused: false,
};
let shutdownManager;
async function addNewBotToMeeting(config) {
    state.config = config;
    const browser = await browserSetup_1.BrowserSetup.initializeBrowser();
    state.browser = browser;
    const page = await browserSetup_1.BrowserSetup.createBrowserContext(browser);
    state.platform = (0, platformFactory_1.platformFactory)(config, page);
    shutdownManager = new shutdownManager_1.ShutdownManager(state.browser, state.platform);
    await browserSetup_1.BrowserSetup.registerGracefulShutdownHandler(page, () => shutdownManager.performGracefulLeave());
    await browserSetup_1.BrowserSetup.applyAntiDetectionMeasures(page);
    shutdownManager.updatePlatform(state.platform);
    const hasJoined = await state.platform.joinMeeting();
    if (hasJoined) {
        await initializeHubClient(config);
        await state.platform.observeTranscriptions(onTranscriptionReceived);
    }
}
async function initializeHubClient(config) {
    state.hubClient = new meetingHubClient_1.MeetingHubClient(config);
    const isConnected = await state.hubClient.startConnection();
    if (!isConnected) {
        logger_1.logger.error(constants_1.LogMessages.BotManager.hubClientNotInitialized);
        await state.platform?.leaveMeeting();
        process.exit(1);
    }
}
async function onTranscriptionReceived(message) {
    if (!state.hubClient) {
        logger_1.logger.error(constants_1.LogMessages.BotManager.hubClientNotInitialized);
        return;
    }
    if (!state.config) {
        logger_1.logger.error("[BotManager] Meeting configuration is not set.");
        return;
    }
    message.meetId = state.config.meetId;
    if (!state.isPaused) {
        await state.hubClient.sendMessage(message);
    }
}
process.on("SIGTERM", () => shutdownManager.handleProcessShutdown("SIGTERM"));
process.on("SIGINT", () => shutdownManager.handleProcessShutdown("SIGINT"));
