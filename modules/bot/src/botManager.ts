import { IMeetingPlatform, MeetingConfiguration, EntryMessage } from "./types";
import { logger } from "./common/utils/logger";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { chromium } from "playwright-extra";
import { Browser, Page } from "playwright-core";
import {
  BROWSER_ARGS,
  ErrorMessages,
  LogMessages,
  USER_AGENT,
} from "./common/constants";
import { MeetingHubClient } from "./hub/meetingHubClient";
import { platformFactory } from "./platforms/platformFactory";

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
export async function addNewBotToMeeting(
  config: MeetingConfiguration
): Promise<void> {
  meetingConfig = config;
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

  meetingPlatform = platformFactory(config, page);
  let isJoined = await meetingPlatform.joinMeeting();
  if (isJoined) {
    hubClient = new MeetingHubClient(config);
    const isConnected = await hubClient.startConnection();

    if (!isConnected) {
      logger.error(LogMessages.BotManager.hubClientNotInitialized);
      meetingPlatform.leaveMeeting();
      process.exit(1);
    }

    await meetingPlatform.observeTranscriptions(handleTranscription);
    // await meetingPlatform.observeParticipations(handleParticipation);
  }
}

async function handleTranscription(message: EntryMessage): Promise<void> {
  if (!hubClient) {
    logger.error(LogMessages.BotManager.hubClientNotInitialized);
    return;
  }

  message.meetId = meetingConfig.meetId;
  if (!meetingHasPaused) {
    await hubClient.sendMessage(message);
  }
}

// async function handleParticipation(message: any): Promise<void> {
//   if (!hubClient) {
//     logger.error(
//       "[Program] [handleParticipation] Hub client is not initialized."
//     );
//     return;
//   }
//   message.meetingId = meetingConfig.meetId;
//   logger.info(
//     `[Program] [handleParticipation] Sending participation message: ${JSON.stringify(
//       message
//     )}`
//   );
//   await hubClient.sendMessage(message);
// }

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
    logger.info(`${LogMessages.BotManager.browserRequested}`);

    if (shuttingDown) {
      logger.info(`${LogMessages.BotManager.shutdownAlreadyInProgress}`);
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
    logger.info(LogMessages.BotManager.shutdownAlreadyInProgress);
    return;
  }

  shuttingDown = true;

  try {
    if (browser && browser.isConnected()) {
      logger.info(LogMessages.BotManager.closingBrowserInstance);
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
    logger.info(LogMessages.BotManager.alreadyInProgress);
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
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
