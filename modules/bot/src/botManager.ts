import { IMeetingPlatform, MeetingConfiguration, EntryMessage } from "./types";
import { logger } from "./common/utils/logger";
import { LogMessages } from "./common/constants";
import { MeetingHubClient } from "./hub/meetingHubClient";
import { platformFactory } from "./platforms/platformFactory";
import { BrowserSetup } from "./common/browserSetup";
import { ShutdownManager } from "./common/shutdownManager";
import { Browser } from "playwright-core";

interface BotManagerState {
  browser: Browser | null;
  platform: IMeetingPlatform | null;
  hubClient: MeetingHubClient | null;
  config: MeetingConfiguration | null;
  isPaused: boolean;
}

const state: BotManagerState = {
  browser: null,
  platform: null,
  hubClient: null,
  config: null,
  isPaused: false,
};

let shutdownManager: ShutdownManager;

export async function addNewBotToMeeting(
  config: MeetingConfiguration
): Promise<void> {
  state.config = config;

  const browser = await BrowserSetup.initializeBrowser();
  state.browser = browser;

  const page = await BrowserSetup.createBrowserContext(browser);
  state.platform = platformFactory(config, page);
  shutdownManager = new ShutdownManager(state.browser, state.platform);

  await BrowserSetup.registerGracefulShutdownHandler(page, () =>
    shutdownManager.performGracefulLeave()
  );
  await BrowserSetup.applyAntiDetectionMeasures(page);

  shutdownManager.updatePlatform(state.platform);

  const hasJoined = await state.platform.joinMeeting();

  if (hasJoined) {
    await initializeHubClient(config);
    await state.platform.observeTranscriptions(onTranscriptionReceived);
  }
}

async function initializeHubClient(
  config: MeetingConfiguration
): Promise<void> {
  state.hubClient = new MeetingHubClient(config);
  const isConnected = await state.hubClient.startConnection();

  if (!isConnected) {
    logger.error(LogMessages.BotManager.hubClientNotInitialized);
    await state.platform?.leaveMeeting();
    process.exit(1);
  }
}

async function onTranscriptionReceived(message: EntryMessage): Promise<void> {
  if (!state.hubClient) {
    logger.error(LogMessages.BotManager.hubClientNotInitialized);
    return;
  }

  if (!state.config) {
    logger.error("[BotManager] Meeting configuration is not set.");
    return;
  }

  message.meetId = state.config.meetId;
  if (!state.isPaused) {
    await state.hubClient.sendMessage(message);
  }
}

process.on("SIGTERM", () => shutdownManager.handleProcessShutdown("SIGTERM"));
process.on("SIGINT", () => shutdownManager.handleProcessShutdown("SIGINT"));
