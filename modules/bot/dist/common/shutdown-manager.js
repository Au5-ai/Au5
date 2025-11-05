"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShutdownManager = void 0;
const logger_1 = require("./utils/logger");
const constants_1 = require("./constants");
class ShutdownManager {
    constructor(browser, platform) {
        this.browser = browser;
        this.platform = platform;
        this.isShuttingDown = false;
    }
    async handleProcessShutdown(signal) {
        if (this.isShuttingDown) {
            logger_1.logger.info(constants_1.LogMessages.BotManager.shutdownAlreadyInProgress);
            return;
        }
        this.isShuttingDown = true;
        try {
            if (this.browser?.isConnected()) {
                logger_1.logger.info(constants_1.LogMessages.BotManager.closingBrowserInstance);
                await this.browser.close();
            }
        }
        catch (err) {
            logger_1.logger.error(constants_1.ErrorMessages.browserCloseError(err));
        }
        finally {
            process.exit(signal === "SIGINT" ? 130 : 143);
        }
    }
    async performGracefulLeave() {
        if (this.isShuttingDown) {
            logger_1.logger.info(constants_1.LogMessages.BotManager.alreadyInProgress);
            return;
        }
        this.isShuttingDown = true;
        let leaveSuccess = false;
        try {
            leaveSuccess = (await this.platform?.leaveMeeting()) ?? false;
        }
        catch (error) {
            logger_1.logger.error(`[BotManager] Error during leave: ${error instanceof Error ? error.message : error}`);
        }
        try {
            if (this.browser?.isConnected()) {
                await this.browser.close();
            }
        }
        catch (error) {
            logger_1.logger.error(`[BotManager] Error closing browser: ${error instanceof Error ? error.message : error}`);
        }
        process.exit(leaveSuccess ? 0 : 1);
    }
    updateBrowser(browser) {
        this.browser = browser;
    }
    updatePlatform(platform) {
        this.platform = platform;
    }
    getIsShuttingDown() {
        return this.isShuttingDown;
    }
}
exports.ShutdownManager = ShutdownManager;
