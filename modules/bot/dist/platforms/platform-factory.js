"use strict";
// import { Zoom } from './zoom';
// import { Teams } from './teams';
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformFactory = platformFactory;
const google_1 = require("./google");
function platformFactory(config, page) {
    switch (config.platform.toUpperCase()) {
        case "GOOGLEMEET":
            return new google_1.GoogleMeet(config, page);
        case "ZOOM":
            // return new Zoom(config, page);
            throw new Error(`[PlatformFactory] Zoom platform not implemented yet.`);
        case "TEAMS":
            // return new Teams(config, page);
            throw new Error(`[PlatformFactory] Teams platform not implemented yet.`);
        default:
            throw new Error(`[PlatformFactory] Unsupported platform: ${config.platform}`);
    }
}
