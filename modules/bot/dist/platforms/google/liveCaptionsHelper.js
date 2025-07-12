"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveCaptionsHelper = void 0;
const logger_1 = require("../../utils/logger");
const task_1 = require("../../common/task");
/**
 * Helper class to manage live captions in Google Meet.
 * It provides methods to enable captions, select language, and handle UI interactions.
 */
class LiveCaptionsHelper {
    constructor(page) {
        this.page = page;
    }
    async enableCaptions(languageOption) {
        const turnOnButton = await this.findTurnOnCaptionButton();
        if (turnOnButton) {
            await turnOnButton.click({ force: true });
            logger_1.logger.info("Turn on captions button clicked in visible tab panel");
        }
        else {
            logger_1.logger.warn("turnOnButton not found in visible tab panel");
            return;
        }
        await (0, task_1.delay)(700);
        // const dropdownClicked = await this.getVisibleCaptionsLanguageDropdown();
        // if (dropdownClicked) {
        //   await this.findLanguageOptionByValue(languageOption);
        // }
        // Step 2: Wait for the overlay to reach full opacity (now combo is visible)
      const overlayVisibility =   await this.page.waitForFunction(() => {
            const overlay = document.querySelector(".NmXUuc.P9KVBf.IGXezb");
            if (!overlay)
                return false;
            const style = getComputedStyle(overlay);
            return style.opacity === "1" && style.pointerEvents !== "none";
        });

        if (!overlayVisibility) {
        // Step 3: Click the combo box (now that it's visible)
        await this.page.getByRole("combobox").click({ force: true });
        // Step 4: Click on the language option (e.g. Persian)
        await this.page.click(`[role="option"][data-value="fa-IR"]`, {
            force: true,
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
        // Convert JSHandle to ElementHandle if it's not null
        const element = handle.asElement();
        return element ? element : null;
    }
    async getVisibleCaptionsLanguageDropdown() {
        return await this.page.evaluate(() => {
            const dropdownLocator = document.querySelector(`div[role="combobox"]`);
            if (dropdownLocator instanceof HTMLElement) {
                dropdownLocator.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
                dropdownLocator.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
                dropdownLocator.click();
                return true;
            }
            return false;
        });
    }
    async findLanguageOptionByValue(languageOption) {
        await this.page.evaluate((lang) => {
            const option = document.querySelector(`[role="option"][data-value="${lang}"]`);
            if (option instanceof HTMLElement) {
                option.scrollIntoView({ block: "center" });
                option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
                option.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
                option.click();
            }
        }, languageOption);
    }
}
exports.LiveCaptionsHelper = LiveCaptionsHelper;
