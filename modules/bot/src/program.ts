import { MeetingConfiguration } from "./types";
import { logger } from "./utils/logger";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { chromium } from "playwright-extra";
import { Browser, Page } from "playwright-core";
import { BROWSER_ARGS, USER_AGENT } from "./constants";
import { GoogleMeet } from "./platforms/googleMeet";

let shuttingDown = false;
let browser: Browser | null = null;

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
  logger.info(`Launching meeting bot with configuration:`, {
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

  await exposeGracefulLeave(page);

  await applyAntiDetection(page);

  switch (config.platform) {
    case "google_meet":
      await new GoogleMeet(config, page).hanlde();
      break;
    case "zoom":
      // await handleZoom(config, page);
      break;
    case "teams":
      // await handleTeams(config, page);
      break;
    default:
      logger.info(`Error: Unsupported platform received: ${config.platform}`);
      throw new Error(`Unsupported platform: ${config.platform}`);
  }

  logger.info("Bot execution finished or awaiting external command.");
}

/**
 * Exposes a function named `triggerNodeGracefulLeave` to the browser context via the provided Playwright {@link Page}.
 * When invoked from the browser, this function triggers a graceful shutdown sequence on the Node.js side,
 * unless a shutdown is already in progress.
 *
 * @param page - The Playwright {@link Page} instance to which the function will be exposed.
 * @returns A promise that resolves when the function has been successfully exposed.
 */
async function exposeGracefulLeave(page: Page): Promise<void> {
  await page.exposeFunction("triggerNodeGracefulLeave", async () => {
    logger.info(
      "[GracefulLeave] Browser context requested graceful shutdown via triggerNodeGracefulLeave."
    );
    if (!shuttingDown) {
      logger.info("[GracefulLeave] Initiating graceful leave sequence...");
      await performGracefulLeave(page);
    } else {
      logger.info(
        "[GracefulLeave] Shutdown already in progress. Ignoring duplicate trigger."
      );
    }
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
