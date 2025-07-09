"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveCaptionsHelper = void 0;
const logger_1 = require("../../utils/logger");
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
        // await delay(600);
        // const dropdownClicked = await this.getVisibleCaptionsLanguageDropdown();
        // await delay(RANDOM_DELAY_MAX);
        // await this.findLanguageOptionByValue(languageValue);
    }
    async findLanguageOptionByValue(value, maxRetries = 5, delayMs = 2000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const clicked = await this.page.evaluate((val) => {
                const option = document.querySelector(`[role="option"][data-value="${val}"]`);
                if (option) {
                    option.scrollIntoView({ block: "center" });
                    option.click();
                    return true;
                }
                return false;
            }, value);
            if (clicked) {
                logger_1.logger.info(`Language option '${value}' clicked (attempt ${attempt})`);
                return;
            }
            else {
                logger_1.logger.warn(`Language option '${value}' not found or not clickable (attempt ${attempt})`);
                if (attempt < maxRetries) {
                    await new Promise((res) => setTimeout(res, delayMs));
                }
            }
        }
        logger_1.logger.error(`Failed to click language option '${value}' after ${maxRetries} retries`);
    }
    async getVisibleCaptionsLanguageDropdown(maxRetries = 5, delayMs = 2000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const clicked = await this.page.evaluate(() => {
                const dropdown = document.querySelector('[role="combobox"]');
                if (dropdown) {
                    dropdown.click();
                    return true;
                }
                return false;
            });
            if (clicked) {
                logger_1.logger.info(`CaptionsLanguageDropdown found and clicked (attempt ${attempt})`);
                return true;
            }
            else {
                logger_1.logger.warn(`CaptionsLanguageDropdown not found (attempt ${attempt})`);
                if (attempt < maxRetries) {
                    await new Promise((res) => setTimeout(res, delayMs));
                }
            }
        }
        logger_1.logger.error(`Failed to find and click CaptionsLanguageDropdown after ${maxRetries} attempts`);
        return false;
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
