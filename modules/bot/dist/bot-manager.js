"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewBotToMeeting = addNewBotToMeeting;
const logger_1 = require("./common/utils/logger");
const constants_1 = require("./common/constants");
const meeting_hub_client_1 = require("./hub/meeting-hub-client");
const platform_factory_1 = require("./platforms/platform-factory");
const browser_setup_1 = require("./common/browser-setup");
const shutdown_manager_1 = require("./common/shutdown-manager");
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
    const browser = await browser_setup_1.BrowserSetup.initializeBrowser();
    state.browser = browser;
    const page = await browser_setup_1.BrowserSetup.createBrowserContext(browser);
    state.platform = (0, platform_factory_1.platformFactory)(config, page);
    shutdownManager = new shutdown_manager_1.ShutdownManager(state.browser, state.platform);
    await browser_setup_1.BrowserSetup.registerGracefulShutdownHandler(page, () => shutdownManager.performGracefulLeave());
    await browser_setup_1.BrowserSetup.applyAntiDetectionMeasures(page);
    shutdownManager.updatePlatform(state.platform);
    const hasJoined = await state.platform.joinMeeting();
    if (hasJoined) {
        await initializeHubClient(config);
        await state.platform.observeTranscriptions(onTranscriptionReceived);
    }
}
async function initializeHubClient(config) {
    state.hubClient = new meeting_hub_client_1.MeetingHubClient(config);
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
process.on("SIGTERM", () => shutdownManager?.handleProcessShutdown("SIGTERM"));
process.on("SIGINT", () => shutdownManager?.handleProcessShutdown("SIGINT"));
