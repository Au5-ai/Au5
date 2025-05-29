import {IMeetingPlatform} from "../types";
import {GoogleMeet} from "./googleMeet";

function getMeetingPlatform(url: string): string | null {
  const patterns: {[key: string]: RegExp} = {
    "Google Meet": /https?:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/
    //  Zoom: /https?:\/\/([a-z0-9]+\.)?zoom\.us\/(j|my)\/[a-zA-Z0-9?&=]+/,
    //"Microsoft Teams": /https?:\/\/(teams\.microsoft\.com|teams\.live\.com)\/[a-zA-Z0-9/?&=._-]+/
  };

  for (const [platform, pattern] of Object.entries(patterns)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return null;
}

export function createMeetingPlatformInstance(url: string): IMeetingPlatform {
  // const platform = getMeetingPlatform(url);
  // if (!platform) return null;
  // switch (platform) {
  //   case "Google Meet":
  return new GoogleMeet(url);
  //   case "Zoom":
  //     return null; // Zoom implementation not provided
  //   case "Microsoft Teams":
  //     return null; // Microsoft Teams implementation not provided
  //   default:
  //     return null;
  // }
}
