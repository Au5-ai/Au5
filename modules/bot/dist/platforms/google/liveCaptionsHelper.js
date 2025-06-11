"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveCaptionsHelper = void 0;
const logger_1 = require("../../utils/logger");
const constants_1 = require("./constants");
const task_1 = require("../../common/task");
/**
 * Helper class to manage live captions in Google Meet.
 * It provides methods to enable captions, select language, and handle UI interactions.
 */
class LiveCaptionsHelper {
    constructor(page) {
        this.page = page;
    }
    async enableCaptions(languageValue) {
        const moreOptionsBtn = await this.findMainMoreOptionsButton();
        if (moreOptionsBtn) {
            await moreOptionsBtn.click();
        }
        else {
            logger_1.logger.warn("More Options button not found");
            return;
        }
        await (0, task_1.delay)(constants_1.RANDOM_DELAY_MAX);
        const settingsBtn = await this.findSettingsMenuItem("Settings");
        if (settingsBtn) {
            await settingsBtn.click();
        }
        else {
            logger_1.logger.warn("Settings menu item not found");
            return;
        }
        await (0, task_1.delay)(constants_1.RANDOM_DELAY_MAX);
        let captionsTab = await this.findCaptionsTabButton();
        let retries = 3;
        while (!captionsTab && retries > 0) {
            await (0, task_1.delay)(300);
            captionsTab = await this.findCaptionsTabButton();
            retries--;
        }
        if (captionsTab) {
            await captionsTab.click();
        }
        else {
            logger_1.logger.warn("Captions tab not found after retries");
            return;
        }
        await (0, task_1.delay)(300);
        const comboBox = await this.getVisibleCaptionsLanguageDropdown();
        if (comboBox) {
            await comboBox.click();
        }
        else {
            logger_1.logger.warn("Combobox not found in visible tab panel");
            return;
        }
        await (0, task_1.delay)(constants_1.RANDOM_DELAY_MAX);
        const languageOption = await this.findLanguageOptionByValue(languageValue);
        if (languageOption) {
            await languageOption.click();
        }
        else {
            logger_1.logger.warn(`Language option '${languageValue}' not found`);
            return;
        }
        await (0, task_1.delay)(constants_1.RANDOM_DELAY_MAX);
        const liveRadio = await this.getLiveCaptionsRadioButton();
        if (liveRadio) {
            await liveRadio.click();
        }
        else {
            logger_1.logger.warn("Live captions radio not found");
        }
        const closeButton = await this.findClosedCaptionTab();
        if (closeButton) {
            await closeButton.click();
        }
        else {
            logger_1.logger.warn("Close Button not found");
        }
    }
    async findMainMoreOptionsButton() {
        const buttons = await this.getMoreOptionsButtons("More options");
        if (buttons.length === 1)
            return buttons[0];
        for (const btn of buttons) {
            const isNotParticipant = await btn.evaluate((el) => !el.closest("div[data-participant-id]"));
            const isAutoRejoin = await btn.evaluate((el) => !!el.closest("div[data-is-auto-rejoin]"));
            if (isNotParticipant && isAutoRejoin)
                return btn;
        }
        return null;
    }
    async getMoreOptionsButtons(menuLabel) {
        const all = await this.page.$$(`button[aria-label*="${menuLabel}"]`);
        const labeledButtons = [];
        for (const handle of all) {
            const isHTMLElement = await handle.evaluate((el) => el instanceof HTMLElement);
            if (isHTMLElement)
                labeledButtons.push(handle);
        }
        if (labeledButtons.length)
            return labeledButtons;
        const icons = [
            ...(await this.page.$$("button i.google-symbols")),
            ...(await this.page.$$("button i.google-material-icons")),
        ];
        const filtered = [];
        for (const icon of icons) {
            const text = await icon.evaluate((el) => el.textContent?.trim());
            if (text === "more_vert") {
                const parentHandle = await icon.evaluateHandle((el) => el.parentElement);
                const parentElement = parentHandle.asElement();
                if (parentElement) {
                    const isHtml = await parentElement.evaluate((el) => el instanceof HTMLElement);
                    if (isHtml) {
                        filtered.push(parentElement);
                    }
                }
            }
        }
        return filtered;
    }
    async findSettingsMenuItem(label = "Settings") {
        const elements = await this.page.$$('[role*="menuitem"], [role*="button"]');
        for (const el of elements) {
            const text = await el.evaluate((e) => e.textContent || "");
            if (text.includes(label))
                return el;
        }
        return null;
    }
    async findCaptionsTabButton() {
        const tabs = await this.page.$$("[role=tab]");
        for (const tab of tabs) {
            const text = await tab.evaluate((e) => e.textContent || "");
            if (text.includes("Captions"))
                return tab;
        }
        return null;
    }
    async getVisibleCaptionsLanguageDropdown() {
        const panels = await this.page.$$("div[role=tabpanel]");
        for (const panel of panels) {
            const visible = await panel.evaluate((el) => {
                if (el instanceof HTMLElement) {
                    return (el.offsetWidth > 0 ||
                        el.offsetHeight > 0 ||
                        el.getClientRects().length > 0);
                }
                return false;
            });
            if (visible) {
                const dropdown = await panel.$("[role=combobox]");
                if (dropdown &&
                    (await dropdown.evaluate((d) => d instanceof HTMLElement))) {
                    return dropdown;
                }
            }
        }
        return null;
    }
    async findLanguageOptionByValue(value) {
        let el = await this.page.$(`[role=radio][data-value="${value}"]`);
        if (el)
            return el;
        el = await this.page.$(`[type=radio][name=languageRadioGroup][value="${value}"]`);
        if (el)
            return el;
        el = await this.page.$(`[role=option][data-value="${value}"]`);
        if (el)
            return el;
        return null;
    }
    async getLiveCaptionsRadioButton() {
        const radioGroup = await this.page.$("div[role=radiogroup]");
        if (!radioGroup)
            return null;
        const radio = await radioGroup.$('input[type="radio"][value="live"]');
        return radio;
    }
    async findClosedCaptionTab() {
        const button = await this.page.$("[data-mdc-dialog-action=close]");
        return button;
    }
}
exports.LiveCaptionsHelper = LiveCaptionsHelper;
