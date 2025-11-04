"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotManager = void 0;
const logger_1 = require("./logger");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class ScreenshotManager {
    constructor(baseDir) {
        this.screenshotDir = baseDir || path.join(process.cwd(), "screenshots");
        this.ensureDirectoryExists();
    }
    ensureDirectoryExists() {
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
            logger_1.logger.info(`[Screenshot] Created directory: ${this.screenshotDir}`);
        }
    }
    async takeScreenshot(page, filename, fullPage = true) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const screenshotName = filename || `screenshot-${timestamp}.png`;
        const screenshotPath = path.join(this.screenshotDir, screenshotName);
        try {
            await page.screenshot({
                path: screenshotPath,
                fullPage,
            });
            logger_1.logger.info(`[Screenshot] Saved to: ${screenshotPath}`);
            return screenshotPath;
        }
        catch (error) {
            logger_1.logger.error(`[Screenshot] Failed to take screenshot: ${error}`);
            throw error;
        }
    }
    getScreenshotDirectory() {
        return this.screenshotDir;
    }
}
exports.ScreenshotManager = ScreenshotManager;
