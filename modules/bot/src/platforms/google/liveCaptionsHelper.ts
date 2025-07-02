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
      await turnOnButton.click();
    }
    await delay(RANDOM_DELAY_MAX);

    const comb = await this.getVisibleCaptionsLanguageDropdown();
    if (comb) {
      try {
        logger.info("Clicking combobox to select language");
        await comb.click({ force: true });
      } catch (err) {
        logger.warn("Standard combobox click failed, trying evaluate fallback");
        await this.page.evaluate(() => {
          const combobox = document.querySelector('[role="combobox"]');
          if (combobox instanceof HTMLElement) combobox.click();
        });
      }
    } else {
      logger.warn("Combobox not found in visible tab panel");
      return;
    }

    await delay(RANDOM_DELAY_MAX);

    const languageOption = await this.findLanguageOptionByValue(languageValue);

    if (languageOption) {
      try {
        await languageOption.click({ force: true });
      } catch (err) {
        logger.warn("languageOption click failed, trying evaluate fallback");
        await this.page.evaluate((languageValue) => {
          const option = document.querySelector(
            `[role=option][data-value="${languageValue}"]`
          );
          if (option instanceof HTMLElement) option.click();
        }, languageValue);
      }
    } else {
      logger.warn("languageOption not found in visible tab panel");
      return;
    }
  }

  private async findLanguageOptionByValue(
    value: string
  ): Promise<ElementHandle<HTMLElement> | null> {
    let el = await this.page.$(`[role=radio][data-value="${value}"]`);
    if (el) return el as ElementHandle<HTMLElement>;
    el = await this.page.$(
      `[type=radio][name=languageRadioGroup][value="${value}"]`
    );
    if (el) return el as ElementHandle<HTMLElement>;
    el = await this.page.$(`[role=option][data-value="${value}"]`);
    if (el) return el as ElementHandle<HTMLElement>;
    return null;
  }

  private async getVisibleCaptionsLanguageDropdown(): Promise<ElementHandle<HTMLElement> | null> {
    const dropdown = await this.page.$("[role=combobox]");
    if (
      dropdown &&
      (await dropdown.evaluate((d) => d instanceof HTMLElement))
    ) {
      return dropdown as ElementHandle<HTMLElement>;
    }
    return null;
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

// // import { ElementHandle, Page } from "playwright";
// // import { logger } from "../../utils/logger";
// // import { RANDOM_DELAY_MAX } from "./constants";
// // import { delay } from "../../common/task";

// // /**
// //  * Helper class to manage live captions in Google Meet.
// //  * It provides methods to enable captions, select language, and handle UI interactions.
// //  */
// // export class LiveCaptionsHelper {
// //   constructor(private page: Page) {}

// //   public async enableCaptions(languageValue: string): Promise<void> {
// //     const moreOptionsBtn = await this.findMainMoreOptionsButton();
// //     if (moreOptionsBtn) {
// //       await moreOptionsBtn.click();
// //     } else {
// //       logger.warn("More Options button not found");
// //       return;
// //     }

// //     await delay(RANDOM_DELAY_MAX);
// //     const settingsBtn = await this.findSettingsMenuItem("Settings");
// //     if (settingsBtn) {
// //       await settingsBtn.click();
// //     } else {
// //       logger.warn("Settings menu item not found");
// //       return;
// //     }

// //     await delay(RANDOM_DELAY_MAX);
// //     let captionsTab = await this.findCaptionsTabButton();
// //     let retries = 3;
// //     while (!captionsTab && retries > 0) {
// //       await delay(300);
// //       captionsTab = await this.findCaptionsTabButton();
// //       retries--;
// //     }
// //     if (captionsTab) {
// //       await captionsTab.click();
// //     } else {
// //       logger.warn("Captions tab not found after retries");
// //       return;
// //     }

// //     await delay(300);
// //     const comboBox = await this.getVisibleCaptionsLanguageDropdown();
// //     if (comboBox) {
// //       await comboBox.click();
// //     } else {
// //       logger.warn("Combobox not found in visible tab panel");
// //       return;
// //     }

// //     await delay(RANDOM_DELAY_MAX);
// //     const languageOption = await this.findLanguageOptionByValue(languageValue);
// //     if (languageOption) {
// //       await languageOption.click();
// //     } else {
// //       logger.warn(`Language option '${languageValue}' not found`);
// //       return;
// //     }

// //     await delay(RANDOM_DELAY_MAX);
// //     const liveRadio = await this.getLiveCaptionsRadioButton();
// //     if (liveRadio) {
// //       await liveRadio.click();
// //     } else {
// //       logger.warn("Live captions radio not found");
// //     }

// //     const closeButton = await this.findClosedCaptionTab();
// //     if (closeButton) {
// //       await closeButton.click();
// //     } else {
// //       logger.warn("Close Button not found");
// //     }
// //   }

// //   private async findMainMoreOptionsButton(): Promise<ElementHandle<HTMLElement> | null> {
// //     const buttons = await this.getMoreOptionsButtons("More options");
// //     if (buttons.length === 1) return buttons[0];

// //     for (const btn of buttons) {
// //       const isNotParticipant = await btn.evaluate(
// //         (el) => !el.closest("div[data-participant-id]")
// //       );
// //       const isAutoRejoin = await btn.evaluate(
// //         (el) => !!el.closest("div[data-is-auto-rejoin]")
// //       );
// //       if (isNotParticipant && isAutoRejoin) return btn;
// //     }
// //     return null;
// //   }

// //   private async getMoreOptionsButtons(
// //     menuLabel: string
// //   ): Promise<ElementHandle<HTMLElement>[]> {
// //     const all = await this.page.$$(`button[aria-label*="${menuLabel}"]`);
// //     const labeledButtons: ElementHandle<HTMLElement>[] = [];

// //     for (const handle of all) {
// //       const isHTMLElement = await handle.evaluate(
// //         (el) => el instanceof HTMLElement
// //       );
// //       if (isHTMLElement)
// //         labeledButtons.push(handle as ElementHandle<HTMLElement>);
// //     }

// //     if (labeledButtons.length) return labeledButtons;

// //     const icons = [
// //       ...(await this.page.$$("button i.google-symbols")),
// //       ...(await this.page.$$("button i.google-material-icons")),
// //     ];

// //     const filtered: ElementHandle<HTMLElement>[] = [];
// //     for (const icon of icons) {
// //       const text = await icon.evaluate((el) => el.textContent?.trim());
// //       if (text === "more_vert") {
// //         const parentHandle = await icon.evaluateHandle(
// //           (el) => el.parentElement
// //         );
// //         const parentElement = parentHandle.asElement();
// //         if (parentElement) {
// //           const isHtml = await parentElement.evaluate(
// //             (el) => el instanceof HTMLElement
// //           );
// //           if (isHtml) {
// //             filtered.push(parentElement as ElementHandle<HTMLElement>);
// //           }
// //         }
// //       }
// //     }

// //     return filtered;
// //   }

// //   private async findSettingsMenuItem(
// //     label = "Settings"
// //   ): Promise<ElementHandle<HTMLElement> | null> {
// //     const elements = await this.page.$$('[role*="menuitem"], [role*="button"]');
// //     for (const el of elements) {
// //       const text = await el.evaluate((e) => e.textContent || "");
// //       if (text.includes(label)) return el as ElementHandle<HTMLElement>;
// //     }
// //     return null;
// //   }

// //   private async findCaptionsTabButton(): Promise<ElementHandle<HTMLElement> | null> {
// //     const tabs = await this.page.$$("[role=tab]");
// //     for (const tab of tabs) {
// //       const text = await tab.evaluate((e) => e.textContent || "");
// //       if (text.includes("Captions")) return tab as ElementHandle<HTMLElement>;
// //     }
// //     return null;
// //   }

// //   private async getVisibleCaptionsLanguageDropdown(): Promise<ElementHandle<HTMLElement> | null> {
// //     const panels = await this.page.$$("div[role=tabpanel]");
// //     for (const panel of panels) {
// //       const visible = await panel.evaluate((el) => {
// //         if (el instanceof HTMLElement) {
// //           return (
// //             el.offsetWidth > 0 ||
// //             el.offsetHeight > 0 ||
// //             el.getClientRects().length > 0
// //           );
// //         }
// //         return false;
// //       });

// //       if (visible) {
// //         const dropdown = await panel.$("[role=combobox]");
// //         if (
// //           dropdown &&
// //           (await dropdown.evaluate((d) => d instanceof HTMLElement))
// //         ) {
// //           return dropdown as ElementHandle<HTMLElement>;
// //         }
// //       }
// //     }
// //     return null;
// //   }

// //   private async findLanguageOptionByValue(
// //     value: string
// //   ): Promise<ElementHandle<HTMLElement> | null> {
// //     let el = await this.page.$(`[role=radio][data-value="${value}"]`);
// //     if (el) return el as ElementHandle<HTMLElement>;
// //     el = await this.page.$(
// //       `[type=radio][name=languageRadioGroup][value="${value}"]`
// //     );
// //     if (el) return el as ElementHandle<HTMLElement>;
// //     el = await this.page.$(`[role=option][data-value="${value}"]`);
// //     if (el) return el as ElementHandle<HTMLElement>;
// //     return null;
// //   }

// //   private async getLiveCaptionsRadioButton(): Promise<ElementHandle<HTMLElement> | null> {
// //     const radioGroup = await this.page.$("div[role=radiogroup]");
// //     if (!radioGroup) return null;
// //     const radio = await radioGroup.$('input[type="radio"][value="live"]');
// //     return radio as ElementHandle<HTMLElement> | null;
// //   }

// //   private async findClosedCaptionTab(): Promise<ElementHandle<HTMLElement> | null> {
// //     const button = await this.page.$("[data-mdc-dialog-action=close]");
// //     return button as ElementHandle<HTMLElement> | null;
// //   }

// //   private async findTurnOnCaptionButton(): Promise<ElementHandle<HTMLElement> | null> {
// //     const buttons = await this.page.$$('[role="button"]');

// //     for (const btn of buttons) {
// //       const text = await btn.evaluate((el) =>
// //         (el as HTMLElement).innerText.trim().toLowerCase()
// //       );

// //       if (text.includes("closed_caption_off")) {
// //         return btn as ElementHandle<HTMLElement>;
// //       }
// //     }

// //     return null;
// //   }
// // }

// const LiveCaptionsHelper = {
//   async enableCaptions(languageValue) {
//     const turnOnButton = this.findTurnOnCaptionButton();
//     if (turnOnButton) {
//       turnOnButton.click();
//     } else {
//       console.warn("Turn on captions button not found");
//       return;
//     }

//     await this.delay(1000); // delay after clicking "turn on"

//     const comb = this.getVisibleCaptionsLanguageDropdown();
//     if (comb) {
//       comb.dispatchEvent(new Event("mouseover", { bubbles: true }));
//       await this.delay(300);
//       comb.click();
//     } else {
//       console.warn("Combobox not found in visible tab panel");
//       return;
//     }

//     await this.delay(1000); // wait for dropdown to expand

//     const languageOption = this.findLanguageOptionByValue(languageValue);
//     if (languageOption) {
//       languageOption.click();
//     } else {
//       console.warn(`Language option '${languageValue}' not found`);
//     }
//   },

//   findLanguageOptionByValue(value) {
//     let el = document.querySelector(`[role=radio][data-value="${value}"]`);
//     if (el) return el;

//     el = document.querySelector(
//       `[type=radio][name=languageRadioGroup][value="${value}"]`
//     );
//     if (el) return el;

//     el = document.querySelector(`[role=option][data-value="${value}"]`);
//     if (el) return el;

//     return null;
//   },

//   getVisibleCaptionsLanguageDropdown() {
//     const dropdown = document.querySelector('[role="combobox"]');
//     return dropdown instanceof HTMLElement ? dropdown : null;
//   },

//   findTurnOnCaptionButton() {
//     const buttons = document.querySelectorAll('[role="button"]');
//     for (const btn of buttons) {
//       const text = btn.innerText?.trim().toLowerCase();
//       if (text.includes("closed_caption_off")) {
//         return btn;
//       }
//     }
//     return null;
//   },

//   delay(ms) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   },
// };
