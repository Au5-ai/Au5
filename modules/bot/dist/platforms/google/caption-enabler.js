"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionEnabler = void 0;
const logger_1 = require("../../common/utils/logger");
const utils_1 = require("../../common/utils");
class CaptionEnabler {
    constructor(page) {
        this.page = page;
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY_MS = 1000;
        this.STEP_DELAY_MS = 700;
        this.COMBOBOX_TIMEOUT_MS = 3000;
        this.DROPDOWN_DELAY_MS = 500;
        this.LANGUAGE_SELECTION_DELAY_MS = 500;
    }
    async activate(languageValue) {
        logger_1.logger.info("[CaptionEnabler] Starting caption activation process...");
        try {
            await this.retryWithBackoff(async () => await this.dismissOverlayIfPresent(), "Dismiss overlay", 1);
            const turnOnButton = await this.retryWithBackoff(async () => await this.findTurnOnCaptionButton(), "Find caption button", this.MAX_RETRIES);
            if (!turnOnButton) {
                throw new Error("Caption button not found after retries");
            }
            await this.retryWithBackoff(async () => {
                await turnOnButton.click({ force: true });
                await (0, utils_1.delay)(this.STEP_DELAY_MS);
                return true;
            }, "Click caption button", this.MAX_RETRIES);
            const overlayReady = await this.retryWithBackoff(async () => await this.activateLanguageDropdownOverlay(), "Activate language overlay", this.MAX_RETRIES);
            if (!overlayReady) {
                logger_1.logger.info("[CaptionEnabler] Language overlay not available, captions may be enabled without language selection");
                await this.verifyCaptionsEnabled();
                return;
            }
            await (0, utils_1.delay)(this.STEP_DELAY_MS);
            const dropdownClicked = await this.retryWithBackoff(async () => await this.clickLanguageDropdown(), "Click language dropdown", this.MAX_RETRIES);
            if (!dropdownClicked) {
                logger_1.logger.info("[CaptionEnabler] Failed to open language dropdown, using default language");
                await this.verifyCaptionsEnabled();
                return;
            }
            const languageSelected = await this.retryWithBackoff(async () => await this.selectLanguageOption(languageValue), `Select language ${languageValue}`, this.MAX_RETRIES);
            if (!languageSelected) {
                logger_1.logger.info(`[CaptionEnabler] Failed to select language "${languageValue}", attempting fallback`);
                await this.selectLanguageFallback(languageValue);
            }
            await this.verifyCaptionsEnabled();
            logger_1.logger.info(`[CaptionEnabler] Successfully activated captions with language: ${languageValue}`);
        }
        catch (error) {
            logger_1.logger.error(`[CaptionEnabler] Failed to activate captions: ${error.message}`);
            throw error;
        }
    }
    async retryWithBackoff(operation, operationName, maxRetries) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger_1.logger.info(`[CaptionEnabler] Attempting ${operationName} (${attempt}/${maxRetries})`);
                const result = await operation();
                if (result !== null && result !== false) {
                    logger_1.logger.info(`[CaptionEnabler] ${operationName} succeeded`);
                    return result;
                }
                if (attempt === maxRetries) {
                    logger_1.logger.info(`[CaptionEnabler] ${operationName} returned ${result} after ${maxRetries} attempts`);
                    return result;
                }
            }
            catch (error) {
                lastError = error;
                logger_1.logger.info(`[CaptionEnabler] ${operationName} failed (attempt ${attempt}/${maxRetries}): ${lastError.message}`);
            }
            if (attempt < maxRetries) {
                const backoffDelay = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                logger_1.logger.info(`[CaptionEnabler] Waiting ${backoffDelay}ms before retry...`);
                await (0, utils_1.delay)(backoffDelay);
            }
        }
        if (lastError) {
            throw new Error(`${operationName} failed after ${maxRetries} attempts: ${lastError.message}`);
        }
        throw new Error(`${operationName} failed after ${maxRetries} attempts`);
    }
    async verifyCaptionsEnabled() {
        logger_1.logger.info("[CaptionEnabler] Verifying captions are enabled...");
        try {
            const captionsEnabled = await this.page.evaluate(() => {
                const captionButton = Array.from(document.querySelectorAll('[role="button"]')).find((btn) => btn.textContent?.toLowerCase().includes("closed_caption"));
                if (!captionButton)
                    return false;
                const isOn = captionButton.innerText
                    .trim()
                    .toLowerCase()
                    .includes("closed_caption_on");
                return isOn;
            });
            if (captionsEnabled) {
                logger_1.logger.info("[CaptionEnabler] Captions verified as enabled");
                return true;
            }
            else {
                logger_1.logger.warn("[CaptionEnabler] Could not verify captions are enabled, but continuing");
                return false;
            }
        }
        catch (error) {
            logger_1.logger.error(`[CaptionEnabler] Verification failed: ${error.message}`);
            return false;
        }
    }
    async selectLanguageFallback(languageValue) {
        logger_1.logger.info(`[CaptionEnabler] Attempting fallback language selection for: ${languageValue}`);
        try {
            const fallbackSuccess = await this.page.evaluate((value) => {
                const baseLanguage = value.split("-")[0];
                const options = Array.from(document.querySelectorAll('[role="option"]'));
                for (const option of options) {
                    const dataValue = option.getAttribute("data-value");
                    const textContent = option.textContent?.toLowerCase() || "";
                    if (dataValue?.startsWith(baseLanguage) ||
                        textContent.includes(baseLanguage)) {
                        option.scrollIntoView({ block: "center" });
                        option.click();
                        return true;
                    }
                }
                if (options.length > 0) {
                    options[0].scrollIntoView({ block: "center" });
                    options[0].click();
                    return true;
                }
                return false;
            }, languageValue);
            if (fallbackSuccess) {
                logger_1.logger.info("[CaptionEnabler] Fallback language selection succeeded");
            }
            else {
                logger_1.logger.warn("[CaptionEnabler] Fallback language selection failed");
            }
        }
        catch (error) {
            logger_1.logger.error(`[CaptionEnabler] Fallback selection error: ${error.message}`);
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
        logger_1.logger.info("[CaptionEnabler] Searching for caption button...");
        const handle = await this.page.evaluateHandle(() => {
            const findButton = () => {
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
                return null;
            };
            return findButton();
        });
        const element = handle.asElement();
        if (element) {
            logger_1.logger.info("[CaptionEnabler] Caption button found");
            return element;
        }
        else {
            logger_1.logger.warn("[CaptionEnabler] Caption button not found");
            return null;
        }
    }
    async activateLanguageDropdownOverlay() {
        logger_1.logger.info("[CaptionEnabler] Activating language dropdown overlay...");
        return await this.page.evaluate(() => {
            const findOverlay = () => {
                const exactSelector = ".NmXUuc.P9KVBf.IGXezb";
                let overlay = document.querySelector(exactSelector);
                if (overlay)
                    return overlay;
                overlay = document.querySelector('[class*="NmXUuc"][class*="P9KVBf"][class*="IGXezb"]');
                if (overlay)
                    return overlay;
                return null;
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
    async clickLanguageDropdown() {
        logger_1.logger.info("[CaptionEnabler] Attempting to click language dropdown...");
        try {
            const combobox = await this.page.waitForSelector('[role="combobox"]', {
                timeout: this.COMBOBOX_TIMEOUT_MS,
                state: "visible",
            });
            if (combobox) {
                await combobox.click({ force: true });
                await (0, utils_1.delay)(this.DROPDOWN_DELAY_MS);
                logger_1.logger.info("[CaptionEnabler] Dropdown clicked successfully");
                return true;
            }
            return false;
        }
        catch (error) {
            logger_1.logger.warn(`[CaptionEnabler] Combobox not visible, trying alternative approach: ${error.message}`);
            try {
                const fallbackSuccess = await this.page.evaluate(() => {
                    const combobox = document.querySelector('[role="combobox"]');
                    if (combobox instanceof HTMLElement) {
                        combobox.scrollIntoView({ block: "center" });
                        combobox.click();
                        return true;
                    }
                    const select = document.querySelector('select, [aria-haspopup="listbox"]');
                    if (select instanceof HTMLElement) {
                        select.click();
                        return true;
                    }
                    return false;
                });
                if (fallbackSuccess) {
                    await (0, utils_1.delay)(this.DROPDOWN_DELAY_MS);
                    logger_1.logger.info("[CaptionEnabler] Dropdown clicked via fallback method");
                }
                return fallbackSuccess;
            }
            catch (fallbackError) {
                logger_1.logger.error(`[CaptionEnabler] All dropdown click attempts failed: ${fallbackError.message}`);
                return false;
            }
        }
    }
    async selectLanguageOption(languageValue) {
        logger_1.logger.info(`[CaptionEnabler] Selecting language option: ${languageValue}`);
        await (0, utils_1.delay)(this.LANGUAGE_SELECTION_DELAY_MS);
        return await this.page.evaluate((value) => {
            const option = document.querySelector(`[role="option"][data-value="${value}"]`);
            if (option) {
                option.scrollIntoView({ block: "center" });
                option.click();
                return true;
            }
            const options = Array.from(document.querySelectorAll('[role="option"]'));
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
exports.CaptionEnabler = CaptionEnabler;
