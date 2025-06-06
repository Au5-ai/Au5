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
const constants_1 = require("./constants");
const meetingHubClient_1 = require("./socket/meetingHubClient");
//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const node_fetch_1 = __importStar(require("node-fetch"));
global.fetch = node_fetch_1.default;
global.Headers = node_fetch_1.Headers;
global.Request = node_fetch_1.Request;
global.Response = node_fetch_1.Response;
async function main() {
    const rawConfig = constants_1.MEETING_CONFIG; //process.env.MEETING_CONFIG;
    if (!rawConfig) {
        console.error(constants_1.ErrorMessages.MEETING_CONFIG_NOT_SET);
        process.exit(1);
    }
    let parsedConfig;
    try {
        parsedConfig = JSON.parse(rawConfig);
    }
    catch (error) {
        console.error(constants_1.ErrorMessages.INVALID_MEETING_CONFIG_JSON, error);
        process.exit(1);
    }
    const hubClient = new meetingHubClient_1.MeetingHubClient(parsedConfig);
    await hubClient.startConnection();
    console.log("[SignalR] Connection established successfully.");
    //   try {
    //     await startMeetingBot(parsedConfig);
    //   } catch (error) {
    //     console.error(ErrorMessages.RUNNING_BOT, error);
    //     process.exit(1);
    //   }
}
main();
