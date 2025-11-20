import {
  IMeetingPlatform,
  MeetingConfiguration,
  EntryMessage,
  Participant,
  GuestJoinedInMeetingMessage,
} from "./types";
import { logger } from "./common/utils/logger";
import { LogMessages } from "./common/constants";
import { MeetingHubClient } from "./hub/meeting-hub-client";
import { platformFactory } from "./platforms/platform-factory";
import { BrowserSetup } from "./common/browser-setup";
import { ShutdownManager } from "./common/shutdown-manager";
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
    await state.platform.observeParticipations(onParticipantChanged);
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

async function onParticipantChanged(
  participants: Participant[]
): Promise<void> {
  if (!state.hubClient) {
    logger.error(LogMessages.BotManager.hubClientNotInitialized);
    return;
  }

  if (!state.config) {
    logger.error("[BotManager] Meeting configuration is not set.");
    return;
  }
  const message: GuestJoinedInMeetingMessage = {
    meetId: state.config.meetId,
    guests: participants,
    type: "GuestJoinedInMeeting",
  };
  await state.hubClient.sendMessage(message);
  logger.info("[BotManager] Guest joined:", participants);
}
process.on("SIGTERM", () => shutdownManager?.handleProcessShutdown("SIGTERM"));
process.on("SIGINT", () => shutdownManager?.handleProcessShutdown("SIGINT"));
