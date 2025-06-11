import {
  IMeetingPlatform,
  MeetingConfiguration,
  TranscriptionEntryMessage,
} from "./types";
import { logger } from "./utils/logger";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { chromium } from "playwright-extra";
import { Browser, Page } from "playwright-core";
import {
  BROWSER_ARGS,
  ErrorMessages,
  LogMessages,
  USER_AGENT,
} from "./common/constants";
import { GoogleMeet } from "./platforms/google";
import { MeetingHubClient } from "./socket/meetingHubClient";

let shuttingDown = false;
let browser: Browser | null = null;
let meetingPlatform: IMeetingPlatform;
let hubClient: MeetingHubClient;
let meetingConfig: MeetingConfiguration;
let meetingHasPaused = false;
/**
 * Starts the meeting bot with the specified configuration.
 *
 * This function initializes the browser with stealth plugins to avoid detection,
 * sets up the browser context with required permissions, and navigates to the
 * appropriate meeting platform based on the provided configuration.
 *
 * Supported platforms:
 * - "google_meet"
 * - "zoom" (currently not implemented)
 * - "teams" (currently not implemented)
 *
 * @param config - The configuration object for the meeting bot, including platform,
 *   meeting URL, bot display name, language, and meeting ID.
 * @returns A promise that resolves when the bot has finished execution or is awaiting
 *   further commands.
 * @throws {Error} If an unsupported platform is specified in the configuration.
 */
export async function startMeetingBot(
  config: MeetingConfiguration
): Promise<void> {
  meetingConfig = config;
  logger.info(`[Program] Launching meeting bot with configuration:`, {
    platform: config.platform,
    meetingUrl: config.meetingUrl,
    botDisplayName: config.botDisplayName,
    language: config.language,
    meetingId: config.meetingId,
  });

  const stealth = StealthPlugin();
  stealth.enabledEvasions.delete("iframe.contentWindow");
  stealth.enabledEvasions.delete("media.codecs");
  chromium.use(stealth);

  browser = await chromium.launch({
    headless: false,
    args: BROWSER_ARGS,
  });

  const context = await browser.newContext({
    permissions: ["camera", "microphone"],
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();
  await registerGracefulShutdownHandler(page);
  await applyAntiDetection(page);

  let isJoined = false;
  switch (config.platform) {
    case "googleMeet":
      meetingPlatform = new GoogleMeet(config, page);
      isJoined = await meetingPlatform.joinMeeting();
      break;
    case "zoom":
      // await handleZoom(config, page);
      break;
    case "teams":
      // await handleTeams(config, page);
      break;
    default:
      logger.info(
        `[Program] Error: Unsupported platform received: ${config.platform}`
      );
      throw new Error(`[Program] Unsupported platform: ${config.platform}`);
  }

  if (isJoined) {
    logger.info(
      `[Program] Bot successfully joined the meeting on platform: ${config.platform}`
    );
    hubClient = new MeetingHubClient(config);
    const isConnected = await hubClient.startConnection();

    if (!isConnected) {
      logger.error(
        `[Program] Failed to connect to the hub service at ${config.hubUrl}`
      );
      meetingPlatform.leaveMeeting();
      process.exit(1);
      return;
    }

    await meetingPlatform.observeTranscriptions(handleTranscription);
    // await meetingPlatform.observeParticipations(handleParticipation);
  }
}

async function handleTranscription(
  message: TranscriptionEntryMessage
): Promise<void> {
  if (!hubClient) {
    logger.error("[Program] Hub client is not initialized.");
    return;
  }

  message.meetingId = meetingConfig.meetingId;
  logger.info(message);

  if (!meetingHasPaused) {
    await hubClient.sendMessage(message);
  }
}

async function handleParticipation(message: any): Promise<void> {
  if (!hubClient) {
    logger.error(
      "[Program] [handleParticipation] Hub client is not initialized."
    );
    return;
  }
  message.meetingId = meetingConfig.meetingId;
  await hubClient.sendMessage(message);
}

/**
 * Registers a function named `triggerNodeGracefulLeave` in the browser context,
 * allowing the browser to request a graceful shutdown of the Node.js process.
 *
 * If a shutdown is already in progress, the request is ignored.
 *
 * @param page - The Playwright {@link Page} instance to which the function will be exposed.
 */

async function registerGracefulShutdownHandler(page: Page): Promise<void> {
  await page.exposeFunction("triggerNodeGracefulLeave", async () => {
    logger.info(`${LogMessages.Program.browserRequested}`);

    if (shuttingDown) {
      logger.info(`${LogMessages.Program.shutdownAlreadyInProgress}`);
      return;
    }

    await performGracefulLeave();
  });
}

/**
 * Applies a set of anti-detection measures to the given Playwright `Page` instance.
 *
 * This function injects a script into the page context that overrides several browser properties
 * commonly used by websites to detect automation tools like Playwright or Selenium. The overridden
 * properties include `navigator.webdriver`, `navigator.plugins`, `navigator.languages`,
 * `navigator.hardwareConcurrency`, `navigator.deviceMemory`, as well as window dimensions.
 *
 * @param page - The Playwright `Page` object to apply anti-detection measures to.
 * @returns A promise that resolves when the anti-detection script has been injected.
 */
async function applyAntiDetection(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "plugins", {
      get: () => [{ name: "Chrome PDF Plugin" }, { name: "Chrome PDF Viewer" }],
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
    Object.defineProperty(window, "innerWidth", { get: () => 1920 });
    Object.defineProperty(window, "innerHeight", { get: () => 1080 });
    Object.defineProperty(window, "outerWidth", { get: () => 1920 });
    Object.defineProperty(window, "outerHeight", { get: () => 1080 });
  });
}

/**
 * Handles graceful shutdown of the bot process and browser.
 * This function is compatible with other shutdown methods and ensures
 * only one shutdown sequence runs at a time.
 *
 * @param signal - The signal that triggered the shutdown (e.g., "SIGINT", "SIGTERM").
 */
const gracefulShutdown = async (signal: string) => {
  if (shuttingDown) {
    logger.info(LogMessages.Program.shutdownAlreadyInProgress);
    return;
  }

  shuttingDown = true;

  try {
    if (browser && browser.isConnected()) {
      logger.info(LogMessages.Program.closingBrowserInstance);
      await browser.close();
    }
  } catch (err) {
    logger.error(ErrorMessages.browserCloseError(err));
  } finally {
    process.exit(signal === "SIGINT" ? 130 : 143);
  }
};

async function performGracefulLeave(): Promise<void> {
  if (shuttingDown) {
    logger.info("[Program] Already in progress, ignoring duplicate call.");
    return;
  }
  shuttingDown = true;

  let leaveSuccess = false;
  try {
    leaveSuccess = await meetingPlatform.leaveMeeting();
  } catch (error) {
    logger.error(
      `[Program] Error during leave: ${
        error instanceof Error ? error.message : error
      }`
    );
  }

  try {
    if (browser && browser.isConnected()) {
      await browser.close();
    } else {
      logger.info(
        "[Program] Browser instance already closed or not available."
      );
    }
  } catch (error) {
    logger.error(
      `[Program] Error closing browser: ${
        error instanceof Error ? error.message : error
      }`
    );
  }

  if (leaveSuccess) {
    process.exit(0);
  } else {
    logger.info(
      "[Program] Leave attempt failed or button not found. Exiting process with code 1 (Failure). Waiting for external termination."
    );
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
