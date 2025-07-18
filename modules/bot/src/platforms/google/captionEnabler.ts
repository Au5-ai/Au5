import { ElementHandle, Page } from "playwright";
import { logger } from "../../utils/logger";
import { delay } from "../../utils";

/**
 * Class to handle enabling live captions in Google Meet.
 */
export class CaptionEnabler {
  constructor(private page: Page) {}

  public async enable(languageValue: string): Promise<void> {
    const overlayDismissed = await this.dismissOverlayIfPresent();
    if (!overlayDismissed) {
      logger.debug("No overlay dialog present, proceeding.");
    }

    const turnOnButton = await this.findTurnOnCaptionButton();
    if (!turnOnButton) {
      logger.warn('Turn on captions" button not found in visible tab panel.');
      return;
    }

    await turnOnButton.click({ force: true });
    await delay(700);

    const overlayReady = await this.activateLanguageDropdownOverlay();
    if (!overlayReady) {
      logger.warn(
        "Captions language overlay not activated — skipping language selection."
      );
      return;
    }

    await delay(700);

    const dropdownClicked = await this.clickLanguageDropdown();
    if (!dropdownClicked) {
      logger.error("Failed to click on the language dropdown combobox.");
      return;
    }

    const languageSelected = await this.selectLanguageOption(languageValue);
    if (!languageSelected) {
      logger.error(`Failed to select language option "${languageValue}".`);
    }

    logger.info(`Successfully selected language: ${languageValue}`);
  }

  private async dismissOverlayIfPresent(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return false;

      const okButton = dialog.querySelector(
        '[data-mdc-dialog-action="ok"]'
      ) as HTMLElement;
      if (okButton) {
        okButton.click();
        return true;
      }

      return false;
    });
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
        ".NmXUuc.P9KVBf.IGXezb"
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

  private async clickLanguageDropdown(): Promise<boolean> {
    try {
      const combobox = await this.page.waitForSelector('[role="combobox"]', {
        timeout: 3000,
        state: "visible",
      });

      if (combobox) {
        await combobox.click({ force: true });
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Combobox click failed: ${(error as Error).message}`);
      return false;
    }
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
