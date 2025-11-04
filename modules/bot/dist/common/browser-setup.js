"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserSetup = void 0;
const logger_1 = require("./utils/logger");
const constants_1 = require("./constants");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const playwright_extra_1 = require("playwright-extra");
class BrowserSetup {
    static async initializeBrowser() {
        const stealth = (0, puppeteer_extra_plugin_stealth_1.default)();
        stealth.enabledEvasions.delete("iframe.contentWindow");
        stealth.enabledEvasions.delete("media.codecs");
        playwright_extra_1.chromium.use(stealth);
        return await playwright_extra_1.chromium.launch({
            headless: false,
            args: constants_1.BROWSER_ARGS,
        });
    }
    static async createBrowserContext(browser) {
        const context = await browser.newContext({
            permissions: ["camera", "microphone"],
            userAgent: constants_1.USER_AGENT,
            viewport: { width: 1280, height: 720 },
        });
        return await context.newPage();
    }
    static async applyAntiDetectionMeasures(page) {
        await page.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => undefined });
            Object.defineProperty(navigator, "plugins", {
                get: () => [
                    { name: "Chrome PDF Plugin" },
                    { name: "Chrome PDF Viewer" },
                ],
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
    static async registerGracefulShutdownHandler(page, onShutdown) {
        await page.exposeFunction("triggerNodeGracefulLeave", async () => {
            logger_1.logger.info(`${constants_1.LogMessages.BotManager.browserRequested}`);
            await onShutdown();
        });
    }
}
exports.BrowserSetup = BrowserSetup;
