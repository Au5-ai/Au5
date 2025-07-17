"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveCaptionsHelper = void 0;
const logger_1 = require("../../utils/logger");
const task_1 = require("../../common/task");
/**
 * Helper class to manage live captions in Google Meet.
 */
class LiveCaptionsHelper {
    constructor(page) {
        this.page = page;
    }
    async enableCaptions(languageValue) {
        const overlayDismissed = await this.dismissOverlayIfPresent();
        if (!overlayDismissed) {
            logger_1.logger.debug("No overlay dialog present, proceeding.");
        }
        const turnOnButton = await this.findTurnOnCaptionButton();
        if (!turnOnButton) {
            logger_1.logger.warn('Turn on captions" button not found in visible tab panel.');
            return;
        }
        await turnOnButton.click({ force: true });
        await (0, task_1.delay)(700);
        const overlayReady = await this.activateLanguageDropdownOverlay();
        if (!overlayReady) {
            logger_1.logger.warn("Captions language overlay not activated — skipping language selection.");
            return;
        }
        await (0, task_1.delay)(700);
        const dropdownClicked = await this.clickLanguageDropdown();
        if (!dropdownClicked) {
            logger_1.logger.error("Failed to click on the language dropdown combobox.");
            return;
        }
        const languageSelected = await this.selectLanguageOption(languageValue);
        if (!languageSelected) {
            logger_1.logger.error(`Failed to select language option "${languageValue}".`);
        }
    }
    async dismissOverlayIfPresent() {
        return await this.page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]');
            if (!dialog)
                return false;
            const okButton = dialog.querySelector('[data-mdc-dialog-action="ok"]');
            if (okButton) {
                okButton.click();
                return true;
            }
            return false;
        });
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
            const overlay = document.querySelector(".NmXUuc.P9KVBf.IGXezb");
            if (overlay) {
                overlay.style.opacity = "1";
                overlay.style.pointerEvents = "auto";
                overlay.style.display = "block";
                return true;
            }
            return false;
        });
    }
    async clickLanguageDropdown() {
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
        }
        catch (error) {
            logger_1.logger.error(`Combobox click failed: ${error.message}`);
            return false;
        }
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
