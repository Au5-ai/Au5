"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const program_1 = require("./program");
async function main() {
    //const rawConfig = process.env.MEETING_CONFIG;
    const rawConfig = constants_1.MEETING_CONFIG;
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
    try {
        await (0, program_1.startMeetingBot)(parsedConfig);
    }
    catch (error) {
        console.error(constants_1.ErrorMessages.RUNNING_BOT, error);
        process.exit(1);
    }
}
main();
