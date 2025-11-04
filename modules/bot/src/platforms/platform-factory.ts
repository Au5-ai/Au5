// import { Zoom } from './zoom';
// import { Teams } from './teams';

import { IMeetingPlatform, MeetingConfiguration } from "../types";
import { GoogleMeet } from "./google";

export function platformFactory(
  config: MeetingConfiguration,
  page: any
): IMeetingPlatform {
  switch (config.platform.toUpperCase()) {
    case "GOOGLEMEET":
      return new GoogleMeet(config, page);
    case "ZOOM":
      // return new Zoom(config, page);
      throw new Error(`[PlatformFactory] Zoom platform not implemented yet.`);
    case "TEAMS":
      // return new Teams(config, page);
      throw new Error(`[PlatformFactory] Teams platform not implemented yet.`);
    default:
      throw new Error(
        `[PlatformFactory] Unsupported platform: ${config.platform}`
      );
  }
}
