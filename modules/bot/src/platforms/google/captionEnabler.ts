import { ElementHandle, Page } from "playwright";
import { logger } from "../../common/utils/logger";
import { delay } from "../../common/utils";

/**
 * Class to handle enabling live captions in Google Meet.
 */
export class CaptionEnabler {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly STEP_DELAY_MS = 700;

  constructor(private page: Page) {}

  public async activate(languageValue: string): Promise<void> {
    logger.info("[CaptionEnabler] Starting caption activation process...");

    try {
      await this.retryWithBackoff(
        async () => await this.dismissOverlayIfPresent(),
        "Dismiss overlay",
        1
      );

      const turnOnButton = await this.retryWithBackoff(
        async () => await this.findTurnOnCaptionButton(),
        "Find caption button",
        this.MAX_RETRIES
      );

      if (!turnOnButton) {
        throw new Error("Caption button not found after retries");
      }

      await this.retryWithBackoff(
        async () => {
          await turnOnButton.click({ force: true });
          await delay(this.STEP_DELAY_MS);
          return true;
        },
        "Click caption button",
        this.MAX_RETRIES
      );

      const overlayReady = await this.retryWithBackoff(
        async () => await this.activateLanguageDropdownOverlay(),
        "Activate language overlay",
        this.MAX_RETRIES
      );

      if (!overlayReady) {
        logger.warn(
          "[CaptionEnabler] Language overlay not available, captions may be enabled without language selection"
        );
        await this.verifyCaptionsEnabled();
        return;
      }

      await delay(this.STEP_DELAY_MS);

      const dropdownClicked = await this.retryWithBackoff(
        async () => await this.clickLanguageDropdown(),
        "Click language dropdown",
        this.MAX_RETRIES
      );

      if (!dropdownClicked) {
        logger.warn(
          "[CaptionEnabler] Failed to open language dropdown, using default language"
        );
        await this.verifyCaptionsEnabled();
        return;
      }

      const languageSelected = await this.retryWithBackoff(
        async () => await this.selectLanguageOption(languageValue),
        `Select language ${languageValue}`,
        this.MAX_RETRIES
      );

      if (!languageSelected) {
        logger.warn(
          `[CaptionEnabler] Failed to select language "${languageValue}", attempting fallback`
        );
        await this.selectLanguageFallback(languageValue);
      }

      await this.verifyCaptionsEnabled();
      logger.info(
        `[CaptionEnabler] Successfully activated captions with language: ${languageValue}`
      );
    } catch (error) {
      logger.error(
        `[CaptionEnabler] Failed to activate captions: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(
          `[CaptionEnabler] Attempting ${operationName} (${attempt}/${maxRetries})`
        );
        const result = await operation();
        if (result !== null && result !== false) {
          logger.debug(`[CaptionEnabler] ${operationName} succeeded`);
          return result;
        }
        if (attempt === maxRetries) {
          logger.warn(
            `[CaptionEnabler] ${operationName} returned ${result} after ${maxRetries} attempts`
          );
          return result;
        }
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          `[CaptionEnabler] ${operationName} failed (attempt ${attempt}/${maxRetries}): ${lastError.message}`
        );
      }

      if (attempt < maxRetries) {
        const backoffDelay = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        logger.debug(
          `[CaptionEnabler] Waiting ${backoffDelay}ms before retry...`
        );
        await delay(backoffDelay);
      }
    }

    if (lastError) {
      throw new Error(
        `${operationName} failed after ${maxRetries} attempts: ${lastError.message}`
      );
    }

    throw new Error(`${operationName} failed after ${maxRetries} attempts`);
  }

  private async verifyCaptionsEnabled(): Promise<boolean> {
    logger.debug("[CaptionEnabler] Verifying captions are enabled...");

    try {
      const captionsEnabled = await this.page.evaluate(() => {
        const captionButton = Array.from(
          document.querySelectorAll('[role="button"]')
        ).find((btn) =>
          btn.textContent?.toLowerCase().includes("closed_caption")
        ) as HTMLElement;

        if (!captionButton) return false;

        const isOn = captionButton.innerText
          .trim()
          .toLowerCase()
          .includes("closed_caption_on");
        return isOn;
      });

      if (captionsEnabled) {
        logger.info("[CaptionEnabler] Captions verified as enabled");
        return true;
      } else {
        logger.warn(
          "[CaptionEnabler] Could not verify captions are enabled, but continuing"
        );
        return false;
      }
    } catch (error) {
      logger.warn(
        `[CaptionEnabler] Verification failed: ${(error as Error).message}`
      );
      return false;
    }
  }

  private async selectLanguageFallback(languageValue: string): Promise<void> {
    logger.info(
      `[CaptionEnabler] Attempting fallback language selection for: ${languageValue}`
    );

    try {
      const fallbackSuccess = await this.page.evaluate((value) => {
        const baseLanguage = value.split("-")[0];

        const options = Array.from(
          document.querySelectorAll('[role="option"]')
        ) as HTMLElement[];

        for (const option of options) {
          const dataValue = option.getAttribute("data-value");
          const textContent = option.textContent?.toLowerCase() || "";

          if (
            dataValue?.startsWith(baseLanguage) ||
            textContent.includes(baseLanguage)
          ) {
            option.scrollIntoView({ block: "center" });
            option.click();
            return true;
          }
        }

        if (options.length > 0) {
          logger.warn(
            "[CaptionEnabler] No matching language found, selecting first available option"
          );
          options[0].scrollIntoView({ block: "center" });
          options[0].click();
          return true;
        }

        return false;
      }, languageValue);

      if (fallbackSuccess) {
        logger.info("[CaptionEnabler] Fallback language selection succeeded");
      } else {
        logger.warn("[CaptionEnabler] Fallback language selection failed");
      }
    } catch (error) {
      logger.error(
        `[CaptionEnabler] Fallback selection error: ${(error as Error).message}`
      );
    }
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
    logger.debug("[CaptionEnabler] Searching for caption button...");

    const handle = await this.page.evaluateHandle(() => {
      const findButton = (): HTMLElement | null => {
        const buttons = document.querySelectorAll('[role="button"]');
        for (const btn of buttons) {
          if (btn instanceof HTMLElement) {
            const text = btn.innerText.trim().toLowerCase();
            if (text.includes("closed_caption_off")) {
              return btn;
            }
          }
        }

        for (const btn of buttons) {
          if (btn instanceof HTMLElement) {
            const ariaLabel = btn.getAttribute("aria-label")?.toLowerCase();
            if (ariaLabel?.includes("caption") && ariaLabel?.includes("off")) {
              return btn;
            }
          }
        }

        const captionIcon = document.querySelector(
          '[data-is-muted="true"][aria-label*="caption" i]'
        ) as HTMLElement;
        if (captionIcon) {
          return captionIcon.closest('[role="button"]') as HTMLElement;
        }

        return null;
      };

      return findButton();
    });

    const element = handle.asElement() as ElementHandle<HTMLElement> | null;
    if (element) {
      logger.debug("[CaptionEnabler] Caption button found");
    } else {
      logger.warn("[CaptionEnabler] Caption button not found");
    }

    return element;
  }

  private async activateLanguageDropdownOverlay(): Promise<boolean> {
    logger.debug("[CaptionEnabler] Activating language dropdown overlay...");

    return await this.page.evaluate(() => {
      const findOverlay = (): HTMLElement | null => {
        // Priority 1: Exact class combination
        const exactSelector = ".NmXUuc.P9KVBf.IGXezb";
        let overlay = document.querySelector(exactSelector) as HTMLElement;
        if (overlay) return overlay;

        // Priority 2: Individual classes present
        overlay = document.querySelector(
          '[class*="NmXUuc"][class*="P9KVBf"][class*="IGXezb"]'
        ) as HTMLElement;
        if (overlay) return overlay;

        // Priority 3: Unique attributes
        overlay = document.querySelector(
          '[jscontroller="rRafu"][tooltip-id="ucc-21"]'
        ) as HTMLElement;
        if (overlay) return overlay;

        // Priority 4: Any of the classes
        const classSelectors = [".NmXUuc", ".P9KVBf", ".IGXezb"];
        for (const selector of classSelectors) {
          overlay = document.querySelector(selector) as HTMLElement;
          if (overlay) return overlay;
        }

        // Priority 5: Find by proximity to caption elements
        const captionElements = document.querySelectorAll(
          '[role="combobox"], [aria-label*="caption" i]'
        );
        for (const elem of captionElements) {
          const parent = elem.closest("div") as HTMLElement;
          if (parent && parent.style) {
            overlay = parent;
            break;
          }
        }

        // Priority 6: Search for any hidden overlay-like element
        const allDivs = document.querySelectorAll("div");
        for (const div of allDivs) {
          const style = window.getComputedStyle(div);
          if (
            style.position === "absolute" &&
            (style.opacity === "0" || style.display === "none") &&
            div.querySelector('[role="combobox"]')
          ) {
            return div as HTMLElement;
          }
        }

        return overlay;
      };

      const overlay = findOverlay();

      if (overlay) {
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
        overlay.style.display = "block";
        overlay.style.visibility = "visible";
        return true;
      }
      return false;
    });
  }

  private async clickLanguageDropdown(): Promise<boolean> {
    logger.debug("[CaptionEnabler] Attempting to click language dropdown...");

    try {
      const combobox = await this.page.waitForSelector('[role="combobox"]', {
        timeout: 3000,
        state: "visible",
      });

      if (combobox) {
        await combobox.click({ force: true });
        await delay(500);
        logger.debug("[CaptionEnabler] Dropdown clicked successfully");
        return true;
      }

      return false;
    } catch (error) {
      logger.warn(
        `[CaptionEnabler] Combobox not visible, trying alternative approach: ${
          (error as Error).message
        }`
      );

      try {
        const fallbackSuccess = await this.page.evaluate(() => {
          const combobox = document.querySelector('[role="combobox"]');
          if (combobox instanceof HTMLElement) {
            combobox.scrollIntoView({ block: "center" });
            combobox.click();
            return true;
          }

          const select = document.querySelector(
            'select, [aria-haspopup="listbox"]'
          );
          if (select instanceof HTMLElement) {
            select.click();
            return true;
          }

          return false;
        });

        if (fallbackSuccess) {
          await delay(500);
          logger.debug("[CaptionEnabler] Dropdown clicked via fallback method");
        }

        return fallbackSuccess;
      } catch (fallbackError) {
        logger.error(
          `[CaptionEnabler] All dropdown click attempts failed: ${
            (fallbackError as Error).message
          }`
        );
        return false;
      }
    }
  }

  private async selectLanguageOption(languageValue: string): Promise<boolean> {
    logger.debug(
      `[CaptionEnabler] Selecting language option: ${languageValue}`
    );

    await delay(500);

    return await this.page.evaluate((value) => {
      const option = document.querySelector(
        `[role="option"][data-value="${value}"]`
      ) as HTMLElement;

      if (option) {
        option.scrollIntoView({ block: "center" });
        option.click();
        return true;
      }

      const options = Array.from(
        document.querySelectorAll('[role="option"]')
      ) as HTMLElement[];
      for (const opt of options) {
        if (opt.getAttribute("data-value") === value) {
          opt.scrollIntoView({ block: "center" });
          opt.click();
          return true;
        }
      }

      return false;
    }, languageValue);
  }
}
