import { Browser, Page } from "playwright-core";
import { logger } from "./utils/logger";
import { LogMessages, BROWSER_ARGS, USER_AGENT } from "./constants";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { chromium } from "playwright-extra";

export class BrowserSetup {
  static async initializeBrowser(): Promise<Browser> {
    const stealth = StealthPlugin();
    stealth.enabledEvasions.delete("iframe.contentWindow");
    stealth.enabledEvasions.delete("media.codecs");
    chromium.use(stealth);

    return await chromium.launch({
      headless: false,
      args: BROWSER_ARGS,
    });
  }

  static async createBrowserContext(browser: Browser): Promise<Page> {
    const context = await browser.newContext({
      permissions: ["camera", "microphone"],
      userAgent: USER_AGENT,
      viewport: { width: 1280, height: 720 },
    });

    return await context.newPage();
  }

  static async applyAntiDetectionMeasures(page: Page): Promise<void> {
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

  static async registerGracefulShutdownHandler(
    page: Page,
    onShutdown: () => Promise<void>
  ): Promise<void> {
    await page.exposeFunction("triggerNodeGracefulLeave", async () => {
      logger.info(`${LogMessages.BotManager.browserRequested}`);
      await onShutdown();
    });
  }
}
