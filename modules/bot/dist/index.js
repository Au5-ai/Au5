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
const constants_1 = require("./common/constants");
const botManager_1 = require("./botManager");
const node_fetch_1 = __importStar(require("node-fetch"));
const logger_1 = require("./common/utils/logger");
// Polyfill global fetch (for Node.js)
global.fetch = node_fetch_1.default;
global.Headers = node_fetch_1.Headers;
global.Request = node_fetch_1.Request;
global.Response = node_fetch_1.Response;
async function loadConfig() {
    const rawConfig = process.env.MEETING_CONFIG;
    if (!rawConfig) {
        logger_1.logger.error(constants_1.ErrorMessages.MEETING_CONFIG_NOT_SET);
        process.exit(1);
    }
    try {
        return JSON.parse(rawConfig);
    }
    catch (error) {
        logger_1.logger.error(`${constants_1.ErrorMessages.INVALID_MEETING_CONFIG_JSON}: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
}
async function bootstrapBot(config) {
    try {
        await (0, botManager_1.addNewBotToMeeting)(config);
    }
    catch (error) {
        logger_1.logger.error(`${constants_1.ErrorMessages.RUNNING_BOT}: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
}
async function main() {
    logger_1.logger.info("🚀 Starting Meeting Bot...");
    const config = await loadConfig();
    await bootstrapBot(config);
    logger_1.logger.info("✅ Meeting Bot started successfully.");
}
main().catch((err) => {
    logger_1.logger.error("Unexpected error occurred while starting the bot:", err);
    process.exit(1);
});
