"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveCaptionsHelper = void 0;
const logger_1 = require("../../utils/logger");
class LiveCaptionsHelper {
    async configureCaptions(languageValue) {
        const moreOptionsBtn = this.findMainMoreOptionsButton();
        if (moreOptionsBtn) {
            moreOptionsBtn.click();
        }
        else {
            logger_1.logger.warn("More Options button not found");
            return;
        }
        await delay(200);
        const settingsBtn = this.findSettingsMenuItem("Settings");
        if (settingsBtn) {
            settingsBtn.click();
        }
        else {
            logger_1.logger.warn("Settings menu item not found");
            return;
        }
        await delay(300);
        const captionsTab = this.findCaptionsTabButton();
        if (captionsTab) {
            captionsTab.click();
        }
        else {
            logger_1.logger.warn("Captions tab not found");
            return;
        }
        await delay(300);
        const comboBox = this.getVisibleCaptionsLanguageDropdown();
        if (comboBox) {
            comboBox.click();
        }
        else {
            logger_1.logger.warn("Combobox not found in visible tab panel");
            return;
        }
        await delay(300);
        const languageOption = this.findLanguageOptionByValue(languageValue);
        if (languageOption) {
            languageOption.click();
        }
        else {
            logger_1.logger.warn(`Language option '${languageValue}' not found`);
            return;
        }
        await delay(200);
        const liveRadio = this.getLiveCaptionsRadioButton();
        if (liveRadio) {
            liveRadio.click();
        }
        else {
            logger_1.logger.warn("Live captions radio not found");
        }
        const closeButton = this.findClosedCaptionTab();
        if (closeButton) {
            closeButton.click();
        }
        else {
            logger_1.logger.warn("Close Button not found");
        }
    }
    getMoreOptionsButtons(menuLabel) {
        const labeledButtons = document.querySelectorAll(`button[aria-label*="${menuLabel}"]`);
        if (labeledButtons.length)
            return Array.from(labeledButtons);
        const icons = [
            ...document.querySelectorAll("button i.google-symbols"),
            ...document.querySelectorAll("button i.google-material-icons"),
        ];
        return icons
            .filter((el) => el.textContent?.trim() === "more_vert")
            .map((el) => el.parentElement instanceof HTMLElement ? el.parentElement : el);
    }
    findMainMoreOptionsButton() {
        const buttons = this.getMoreOptionsButtons("More options");
        if (buttons.length === 1)
            return buttons[0];
        return (buttons.find((btn) => !btn.closest("div[data-participant-id]") &&
            btn.closest("div[data-is-auto-rejoin]")) || null);
    }
    findSettingsMenuItem(label = "Settings") {
        return (Array.from(document.querySelectorAll('[role*="menuitem"], [role*="button"]')).find((el) => el.textContent?.includes(label)) ?? null);
    }
    findCaptionsTabButton() {
        return (Array.from(document.querySelectorAll("[role=tab]")).find((el) => el.textContent?.includes("Captions")) ?? null);
    }
    getVisibleCaptionsLanguageDropdown() {
        const panel = Array.from(document.querySelectorAll("div[role=tabpanel]")).find((el) => el instanceof HTMLElement &&
            (el.offsetWidth > 0 ||
                el.offsetHeight > 0 ||
                el.getClientRects().length > 0)) ?? null;
        if (!panel)
            return null;
        const dropdown = panel.querySelector("[role=combobox]");
        return dropdown instanceof HTMLElement ? dropdown : null;
    }
    findLanguageOptionByValue(value) {
        return (document.querySelector(`[role=radio][data-value="${value}"]`) ??
            document.querySelector(`[type=radio][name=languageRadioGroup][value="${value}"]`) ??
            document.querySelector(`[role=option][data-value="${value}"]`));
    }
    getLiveCaptionsRadioButton() {
        const radioGroup = document.querySelector("div[role=radiogroup]");
        if (!radioGroup)
            return null;
        const radio = radioGroup.querySelector('input[type="radio"][value="live"]');
        return radio;
    }
    findClosedCaptionTab() {
        const button = document.querySelector("[data-mdc-dialog-action=close]");
        return button instanceof HTMLElement ? button : null;
    }
}
exports.LiveCaptionsHelper = LiveCaptionsHelper;
