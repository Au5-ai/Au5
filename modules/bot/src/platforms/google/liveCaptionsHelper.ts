import { ElementHandle, Page } from "playwright";
import { logger } from "../../utils/logger";
import { RANDOM_DELAY_MAX } from "./constants";
import { delay } from "../../common/task";

/**
 * Helper class to manage live captions in Google Meet.
 * It provides methods to enable captions, select language, and handle UI interactions.
 */
export class LiveCaptionsHelper {
  constructor(private page: Page) {}

  public async enableCaptions(languageValue: string): Promise<void> {
    const turnOnButton = await this.findTurnOnCaptionButton();
    if (turnOnButton) {
      await turnOnButton.click({ force: true });
      logger.info("Turn on captions button clicked in visible tab panel");
    } else {
      logger.warn("turnOnButton not found in visible tab panel");
      return;
    }

    await delay(600);

    const dropdownClicked = await this.getVisibleCaptionsLanguageDropdown();
    if (dropdownClicked) {
      await this.findLanguageOptionByValue(languageValue);
    }
  }

  private async findTurnOnCaptionButton(): Promise<ElementHandle<HTMLElement> | null> {
    const handle = await this.page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('[role="button"]');
      for (const btn of buttons) {
        if (
          btn instanceof HTMLElement &&
          btn.innerText.trim().toLowerCase().includes("closed_caption_off")
        ) {
          return btn;
        }
      }
      return null;
    });

    // Convert JSHandle to ElementHandle if it's not null
    const element = handle.asElement();
    return element ? (element as ElementHandle<HTMLElement>) : null;
  }

  private async getVisibleCaptionsLanguageDropdown(
    maxRetries = 3,
    delayMs = 500
  ): Promise<boolean> {
    const dropdownLocator = this.page.locator('[role="combobox"]');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const isVisible = await dropdownLocator.isVisible();

      if (isVisible) {
        try {
          await dropdownLocator.click({ force: true });
          logger.info(`CaptionsLanguageDropdown clicked (attempt ${attempt})`);
          return true;
        } catch (err) {
          logger.warn(`Dropdown found but not clickable (attempt ${attempt})`);
        }
      } else {
        logger.warn(`Dropdown not visible (attempt ${attempt})`);
      }

      if (attempt < maxRetries) {
        await this.page.waitForTimeout(delayMs);
      }
    }

    logger.error(
      `Failed to click CaptionsLanguageDropdown after ${maxRetries} attempts`
    );
    return false;
  }

  private async findLanguageOptionByValue(
    value: string,
    maxRetries = 3,
    delayMs = 500
  ): Promise<void> {
    const optionLocator = this.page.locator(
      `[role="option"][data-value="${value}"]`
    );

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await optionLocator.click({ force: true });
        logger.info(`Language option '${value}' clicked (attempt ${attempt})`);
        return;
      } catch (err) {
        logger.warn(
          `Language option '${value}' not clickable (attempt ${attempt})`
        );

        await this.page.waitForTimeout(delayMs);
      }
    }

    logger.error(
      `Failed to click language option '${value}' after ${maxRetries} retries`
    );
  }
}
