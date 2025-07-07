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

    await delay(RANDOM_DELAY_MAX);

    const comb = await this.getVisibleCaptionsLanguageDropdown();
    if (comb) {
      await comb.click({ force: true });
      logger.info("Combobox clicked in visible tab panel");
    } else {
      logger.warn("Combobox not found in visible tab panel");
      return;
    }

    await delay(RANDOM_DELAY_MAX);
    await this.findLanguageOptionByValue(languageValue);
  }

  private async findLanguageOptionByValue(value: string): Promise<void> {
    const clicked = await this.page.evaluate((val: string) => {
      const option = document.querySelector<HTMLElement>(
        `[role="option"][data-value="${val}"]`
      );
      if (option) {
        option.click();
        return true;
      }
      return false;
    }, value);

    if (clicked) {
      logger.info(`Language option '${value}' clicked`);
    } else {
      logger.warn(`Language option '${value}' not found or not clickable`);
    }
  }

  private async getVisibleCaptionsLanguageDropdown(): Promise<ElementHandle<HTMLElement> | null> {
    const handle = await this.page.evaluateHandle(() => {
      const combobox = document.querySelector('[role="combobox"]');
      return combobox;
    });

    const element = handle.asElement();
    return element ? (element as ElementHandle<HTMLElement>) : null;
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
}
