import { Browser } from "playwright-core";
import { IMeetingPlatform } from "../types";
import { logger } from "./utils/logger";
import { ErrorMessages, LogMessages } from "./constants";

export class ShutdownManager {
  private isShuttingDown = false;

  constructor(
    private browser: Browser | null,
    private platform: IMeetingPlatform | null
  ) {}

  async handleProcessShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.info(LogMessages.BotManager.shutdownAlreadyInProgress);
      return;
    }

    this.isShuttingDown = true;

    try {
      if (this.browser?.isConnected()) {
        logger.info(LogMessages.BotManager.closingBrowserInstance);
        await this.browser.close();
      }
    } catch (err) {
      logger.error(ErrorMessages.browserCloseError(err));
    } finally {
      process.exit(signal === "SIGINT" ? 130 : 143);
    }
  }

  async performGracefulLeave(): Promise<void> {
    if (this.isShuttingDown) {
      logger.info(LogMessages.BotManager.alreadyInProgress);
      return;
    }
    this.isShuttingDown = true;

    let leaveSuccess = false;
    try {
      leaveSuccess = (await this.platform?.leaveMeeting()) ?? false;
    } catch (error) {
      logger.error(
        `[BotManager] Error during leave: ${
          error instanceof Error ? error.message : error
        }`
      );
    }

    try {
      if (this.browser?.isConnected()) {
        await this.browser.close();
      }
    } catch (error) {
      logger.error(
        `[BotManager] Error closing browser: ${
          error instanceof Error ? error.message : error
        }`
      );
    }

    process.exit(leaveSuccess ? 0 : 1);
  }

  updateBrowser(browser: Browser | null): void {
    this.browser = browser;
  }

  updatePlatform(platform: IMeetingPlatform | null): void {
    this.platform = platform;
  }

  getIsShuttingDown(): boolean {
    return this.isShuttingDown;
  }
}
