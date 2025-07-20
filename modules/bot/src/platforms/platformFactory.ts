// import { Zoom } from './zoom';
// import { Teams } from './teams';

import { IMeetingPlatform, MeetingConfiguration } from "../types";
import { GoogleMeet } from "./google/googleMeet";

export function platformFactory(
  config: MeetingConfiguration,
  page: any
): IMeetingPlatform {
  switch (config.platform) {
    case "googleMeet":
      return new GoogleMeet(config, page);
    case "zoom":
      // return new Zoom(config, page);
      throw new Error(`[PlatformFactory] Zoom platform not implemented yet.`);
    case "teams":
      // return new Teams(config, page);
      throw new Error(`[PlatformFactory] Teams platform not implemented yet.`);
    default:
      throw new Error(
        `[PlatformFactory] Unsupported platform: ${config.platform}`
      );
  }
}
