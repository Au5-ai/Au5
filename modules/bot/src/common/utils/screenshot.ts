import { Page } from "playwright-core";
import { logger } from "./logger";
import * as path from "path";
import * as fs from "fs";

export class ScreenshotManager {
  private screenshotDir: string;

  constructor(baseDir?: string) {
    this.screenshotDir = baseDir || path.join(process.cwd(), "screenshots");
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
      logger.info(`[Screenshot] Created directory: ${this.screenshotDir}`);
    }
  }

  async takeScreenshot(
    page: Page,
    filename?: string,
    fullPage: boolean = true
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotName = filename || `screenshot-${timestamp}.png`;
    const screenshotPath = path.join(this.screenshotDir, screenshotName);

    try {
      await page.screenshot({
        path: screenshotPath,
        fullPage,
      });
      logger.info(`[Screenshot] Saved to: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      logger.error(`[Screenshot] Failed to take screenshot: ${error}`);
      throw error;
    }
  }

  getScreenshotDirectory(): string {
    return this.screenshotDir;
  }
}
