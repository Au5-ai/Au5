import { ElementHandle, Page } from "playwright";
import { logger } from "../../utils/logger";
import { delay } from "../../common/task";
import { Google_Caption_Configuration } from "./constants";

/**
 * Helper class to manage live captions in Google Meet.
 */
export class LiveCaptionsHelper {
  constructor(private page: Page) {}

  public async enableCaptions(languageValue: string): Promise<void> {
    const turnOnButton = await this.findTurnOnCaptionButton();
    if (!turnOnButton) {
      logger.warn("Turn on captions button not found in visible tab panel.");
      return;
    }

    await turnOnButton.click({ force: true });
    logger.info('Clicked on "Turn on captions" button.');
    await delay(700);

    const overlayReady = await this.activateLanguageDropdownOverlay();
    if (!overlayReady) {
      logger.warn("Overlay not visible, skipping language selection.");
      return;
    }

    logger.info("Overlay activated. Clicking combo box.");
    await this.page.getByRole("combobox").click({ force: true });
    await delay(700);

    const languageSelected = await this.selectLanguageOption(languageValue);
    if (languageSelected) {
      logger.info(`Language "${languageValue}" selected successfully.`);
    } else {
      logger.error(`Failed to select language "${languageValue}".`);
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

    return handle.asElement() as ElementHandle<HTMLElement> | null;
  }

  private async activateLanguageDropdownOverlay(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const overlay = document.querySelector(
        Google_Caption_Configuration.transcriptSelectors.overlay
      ) as HTMLElement;

      if (overlay) {
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
        overlay.style.display = "block";
        return true;
      }
      return false;
    });
  }

  private async selectLanguageOption(languageValue: string): Promise<boolean> {
    return await this.page.evaluate((value) => {
      const option = document.querySelector(
        `[role="option"][data-value="${value}"]`
      ) as HTMLElement;

      if (option) {
        option.scrollIntoView({ block: "center" });
        option.click();
        return true;
      }
      return false;
    }, languageValue);
  }
}
