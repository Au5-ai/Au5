"use strict";
// import { Zoom } from './zoom';
// import { Teams } from './teams';
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformFactory = platformFactory;
const googleMeet_1 = require("./google/googleMeet");
function platformFactory(config, page) {
    switch (config.platform) {
        case "googleMeet":
            return new googleMeet_1.GoogleMeet(config, page);
        case "zoom":
            // return new Zoom(config, page);
            throw new Error(`[PlatformFactory] Zoom platform not implemented yet.`);
        case "teams":
            // return new Teams(config, page);
            throw new Error(`[PlatformFactory] Teams platform not implemented yet.`);
        default:
            throw new Error(`[PlatformFactory] Unsupported platform: ${config.platform}`);
    }
}
