"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveCaptionsHelper = void 0;
const logger_1 = require("../../utils/logger");
const task_1 = require("../../common/task");
const constants_1 = require("./constants");
/**
 * Helper class to manage live captions in Google Meet.
 */
class LiveCaptionsHelper {
    constructor(page) {
        this.page = page;
    }
    async enableCaptions(languageValue) {
        const turnOnButton = await this.findTurnOnCaptionButton();
        if (!turnOnButton) {
            logger_1.logger.warn("Turn on captions button not found in visible tab panel.");
            return;
        }
        await turnOnButton.click({ force: true });
        logger_1.logger.info('Clicked on "Turn on captions" button.');
        await (0, task_1.delay)(700);
        const overlayReady = await this.activateLanguageDropdownOverlay();
        if (!overlayReady) {
            logger_1.logger.warn("Overlay not visible, skipping language selection.");
            return;
        }
        logger_1.logger.info("Overlay activated. Clicking combo box.");
        await (0, task_1.delay)(700);
        const languageSelected = await this.selectLanguageOption(languageValue);
        if (languageSelected) {
            logger_1.logger.info(`Language "${languageValue}" selected successfully.`);
        }
        else {
            logger_1.logger.error(`Failed to select language "${languageValue}".`);
        }
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
        return handle.asElement();
    }
    async activateLanguageDropdownOverlay() {
        return await this.page.evaluate(() => {
            const overlay = document.querySelector(constants_1.Google_Caption_Configuration.transcriptSelectors.overlay);
            if (overlay) {
                overlay.style.opacity = "1";
                overlay.style.pointerEvents = "auto";
                overlay.style.display = "block";
                const combobox = document.querySelector('[role="combobox"]');
                if (combobox) {
                    combobox.click();
                    return true;
                }
            }
            return false;
        });
    }
    async selectLanguageOption(languageValue) {
        return await this.page.evaluate((value) => {
            const option = document.querySelector(`[role="option"][data-value="${value}"]`);
            if (option) {
                option.scrollIntoView({ block: "center" });
                option.click();
                return true;
            }
            return false;
        }, languageValue);
    }
}
exports.LiveCaptionsHelper = LiveCaptionsHelper;
