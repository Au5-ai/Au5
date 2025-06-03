"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMeetingBot = startMeetingBot;
const logger_1 = require("./utils/logger");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const playwright_extra_1 = require("playwright-extra");
const constants_1 = require("./constants");
const googleMeet_1 = require("./platforms/googleMeet");
const meetingHubClient_1 = require("./socket/meetingHubClient");
let shuttingDown = false;
let browser = null;
let meetingPlatform;
let hubClient;
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
async function startMeetingBot(config) {
    logger_1.logger.info(`[Program] Launching meeting bot with configuration:`, {
        platform: config.platform,
        meetingUrl: config.meetingUrl,
        botDisplayName: config.botDisplayName,
        language: config.language,
        meetingId: config.meetingId,
    });
    const stealth = (0, puppeteer_extra_plugin_stealth_1.default)();
    stealth.enabledEvasions.delete("iframe.contentWindow");
    stealth.enabledEvasions.delete("media.codecs");
    playwright_extra_1.chromium.use(stealth);
    browser = await playwright_extra_1.chromium.launch({
        headless: false,
        args: constants_1.BROWSER_ARGS,
    });
    const context = await browser.newContext({
        permissions: ["camera", "microphone"],
        userAgent: constants_1.USER_AGENT,
        viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    await registerGracefulShutdownHandler(page);
    await applyAntiDetection(page);
    switch (config.platform) {
        case "googleMeet":
            meetingPlatform = new googleMeet_1.GoogleMeet(config, page);
            const isJoined = await meetingPlatform.join();
            if (isJoined) {
                hubClient = new meetingHubClient_1.MeetingHubClient(config);
                await hubClient.startConnection();
            }
            break;
        case "zoom":
            // await handleZoom(config, page);
            break;
        case "teams":
            // await handleTeams(config, page);
            break;
        default:
            logger_1.logger.info(`[Program] Error: Unsupported platform received: ${config.platform}`);
            throw new Error(`[Program] Unsupported platform: ${config.platform}`);
    }
    logger_1.logger.info("[Program] Bot execution finished or awaiting external command.");
}
/**
 * Registers a function named `triggerNodeGracefulLeave` in the browser context,
 * allowing the browser to request a graceful shutdown of the Node.js process.
 *
 * If a shutdown is already in progress, the request is ignored.
 *
 * @param page - The Playwright {@link Page} instance to which the function will be exposed.
 */
async function registerGracefulShutdownHandler(page) {
    await page.exposeFunction("triggerNodeGracefulLeave", async () => {
        logger_1.logger.info(`${constants_1.LogMessages.Program.browserRequested}`);
        if (shuttingDown) {
            logger_1.logger.info(`${constants_1.LogMessages.Program.shutdownAlreadyInProgress}`);
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
async function applyAntiDetection(page) {
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
const gracefulShutdown = async (signal) => {
    if (shuttingDown) {
        logger_1.logger.info(constants_1.LogMessages.Program.shutdownAlreadyInProgress);
        return;
    }
    shuttingDown = true;
    try {
        if (browser && browser.isConnected()) {
            logger_1.logger.info(constants_1.LogMessages.Program.closingBrowserInstance);
            await browser.close();
        }
    }
    catch (err) {
        logger_1.logger.error(constants_1.ErrorMessages.browserCloseError(err));
    }
    finally {
        process.exit(signal === "SIGINT" ? 130 : 143);
    }
};
async function performGracefulLeave() {
    if (shuttingDown) {
        logger_1.logger.info("[Program] Already in progress, ignoring duplicate call.");
        return;
    }
    shuttingDown = true;
    let leaveSuccess = false;
    try {
        leaveSuccess = await meetingPlatform.leave();
    }
    catch (error) {
        logger_1.logger.error(`[Program] Error during leave: ${error instanceof Error ? error.message : error}`);
    }
    try {
        if (browser && browser.isConnected()) {
            await browser.close();
        }
        else {
            logger_1.logger.info("[Program] Browser instance already closed or not available.");
        }
    }
    catch (error) {
        logger_1.logger.error(`[Program] Error closing browser: ${error instanceof Error ? error.message : error}`);
    }
    if (leaveSuccess) {
        process.exit(0);
    }
    else {
        logger_1.logger.info("[Program] Leave attempt failed or button not found. Exiting process with code 1 (Failure). Waiting for external termination.");
        process.exit(1);
    }
}
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
