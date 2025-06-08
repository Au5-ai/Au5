import { logger } from "../../utils/logger";

export class LiveCaptionsHelper {
  public async configureCaptions(languageValue: string): Promise<void> {
    const moreOptionsBtn = this.findMainMoreOptionsButton();
    if (moreOptionsBtn) {
      moreOptionsBtn.click();
    } else {
      logger.warn("More Options button not found");
      return;
    }

    await delay(200);
    const settingsBtn = this.findSettingsMenuItem("Settings");
    if (settingsBtn) {
      settingsBtn.click();
    } else {
      logger.warn("Settings menu item not found");
      return;
    }

    await delay(300);
    const captionsTab = this.findCaptionsTabButton();
    if (captionsTab) {
      captionsTab.click();
    } else {
      logger.warn("Captions tab not found");
      return;
    }

    await delay(300);
    const comboBox = this.getVisibleCaptionsLanguageDropdown();
    if (comboBox) {
      comboBox.click();
    } else {
      logger.warn("Combobox not found in visible tab panel");
      return;
    }

    await delay(300);
    const languageOption = this.findLanguageOptionByValue(languageValue);
    if (languageOption) {
      languageOption.click();
    } else {
      logger.warn(`Language option '${languageValue}' not found`);
      return;
    }

    await delay(200);
    const liveRadio = this.getLiveCaptionsRadioButton();
    if (liveRadio) {
      (liveRadio as HTMLElement).click();
    } else {
      logger.warn("Live captions radio not found");
    }

    const closeButton = this.findClosedCaptionTab();
    if (closeButton) {
      (closeButton as HTMLElement).click();
    } else {
      logger.warn("Close Button not found");
    }
  }

  private getMoreOptionsButtons(menuLabel: string): HTMLElement[] {
    const labeledButtons = document.querySelectorAll<HTMLButtonElement>(
      `button[aria-label*="${menuLabel}"]`
    );
    if (labeledButtons.length) return Array.from(labeledButtons);

    const icons = [
      ...document.querySelectorAll<HTMLElement>("button i.google-symbols"),
      ...document.querySelectorAll<HTMLElement>(
        "button i.google-material-icons"
      ),
    ];

    return icons
      .filter((el) => el.textContent?.trim() === "more_vert")
      .map((el) =>
        el.parentElement instanceof HTMLElement ? el.parentElement : el
      );
  }

  private findMainMoreOptionsButton(): HTMLElement | null {
    const buttons = this.getMoreOptionsButtons("More options");
    if (buttons.length === 1) return buttons[0];

    return (
      buttons.find(
        (btn) =>
          !btn.closest("div[data-participant-id]") &&
          btn.closest("div[data-is-auto-rejoin]")
      ) || null
    );
  }

  private findSettingsMenuItem(label = "Settings"): HTMLElement | null {
    return (
      (Array.from(
        document.querySelectorAll('[role*="menuitem"], [role*="button"]')
      ).find((el) => el.textContent?.includes(label)) as HTMLElement) ?? null
    );
  }

  private findCaptionsTabButton(): HTMLElement | null {
    return (
      (Array.from(document.querySelectorAll("[role=tab]")).find((el) =>
        el.textContent?.includes("Captions")
      ) as HTMLElement) ?? null
    );
  }

  private getVisibleCaptionsLanguageDropdown(): HTMLElement | null {
    const panel =
      (Array.from(document.querySelectorAll("div[role=tabpanel]")).find(
        (el) =>
          el instanceof HTMLElement &&
          (el.offsetWidth > 0 ||
            el.offsetHeight > 0 ||
            el.getClientRects().length > 0)
      ) as HTMLElement) ?? null;

    if (!panel) return null;
    const dropdown = panel.querySelector("[role=combobox]");
    return dropdown instanceof HTMLElement ? dropdown : null;
  }

  private findLanguageOptionByValue(value: string): HTMLElement | null {
    return (document.querySelector(`[role=radio][data-value="${value}"]`) ??
      document.querySelector(
        `[type=radio][name=languageRadioGroup][value="${value}"]`
      ) ??
      document.querySelector(
        `[role=option][data-value="${value}"]`
      )) as HTMLElement | null;
  }

  private getLiveCaptionsRadioButton(): HTMLElement | null {
    const radioGroup = document.querySelector("div[role=radiogroup]");
    if (!radioGroup) return null;
    const radio = radioGroup.querySelector<HTMLInputElement>(
      'input[type="radio"][value="live"]'
    );
    return radio;
  }

  private findClosedCaptionTab(): HTMLElement | null {
    const button = document.querySelector("[data-mdc-dialog-action=close]");
    return button instanceof HTMLElement ? button : null;
  }
}
