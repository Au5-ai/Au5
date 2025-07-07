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
        const turnOnButton = await this.findTurnOnCaptionButton();
        if (turnOnButton) {
            await turnOnButton.click({ force: true });
            logger_1.logger.info("Turn on captions button clicked in visible tab panel");
        }
        else {
            logger_1.logger.warn("turnOnButton not found in visible tab panel");
            return;
        }
        await (0, task_1.delay)(constants_1.RANDOM_DELAY_MAX);
        const comb = await this.getVisibleCaptionsLanguageDropdown();
        if (comb) {
            await comb.click({ force: true });
            logger_1.logger.info("Combobox clicked in visible tab panel");
        }
        else {
            logger_1.logger.warn("Combobox not found in visible tab panel");
            return;
        }
        await (0, task_1.delay)(constants_1.RANDOM_DELAY_MAX);
        await this.findLanguageOptionByValue(languageValue);
    }
    async findLanguageOptionByValue(value) {
        const clicked = await this.page.evaluate((val) => {
            const option = document.querySelector(`[role="option"][data-value="${val}"]`);
            if (option) {
                option.click();
                return true;
            }
            return false;
        }, value);
        if (clicked) {
            logger_1.logger.info(`Language option '${value}' clicked`);
        }
        else {
            logger_1.logger.warn(`Language option '${value}' not found or not clickable`);
        }
    }
    async getVisibleCaptionsLanguageDropdown() {
        const handle = await this.page.evaluateHandle(() => {
            const combobox = document.querySelector('[role="combobox"]');
            return combobox;
        });
        const element = handle.asElement();
        return element ? element : null;
    }
    async findTurnOnCaptionButton() {
        const handle = await this.page.evaluateHandle(() => {
            const buttons = document.querySelectorAll('[role="button"]');
            for (const btn of buttons) {
                if (btn instanceof HTMLElement &&
                    btn.innerText.trim().toLowerCase().includes("closed_caption_off")) {
                    return btn;
                }
            }
            return null;
        });
        // Convert JSHandle to ElementHandle if it's not null
        const element = handle.asElement();
        return element ? element : null;
    }
}
exports.LiveCaptionsHelper = LiveCaptionsHelper;
