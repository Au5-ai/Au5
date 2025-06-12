import {IMeetingPlatform} from "../types";
import {GoogleMeet} from "./googleMeet";

export class MeetingPlatformFactory {
  private readonly _url: string;
  constructor(url: string) {
    this._url = url;
  }

  /**
   * Returns an instance of a meeting platform based on the URL.
   * Currently supports Google Meet, Zoom, and Microsoft Teams.
   * @returns {IMeetingPlatform | null} An instance of the meeting platform or null if not recognized.
   */
  getPlatform(): IMeetingPlatform | null {
    let platformName: string | null = null;
    const patterns: {[key: string]: RegExp} = {
      "Google Meet": /https?:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/
    };

    for (const [platform, pattern] of Object.entries(patterns)) {
      if (pattern.test(this._url)) {
        platformName = platform;
      }
    }

    switch (platformName) {
      case "Google Meet":
        return new GoogleMeet(this._url);
      // case "Zoom":
      //   return new Zoom(this._url); // Zoom implementation not provided
      // case "Microsoft Teams":
      //   return new MicrosoftTeams(this._url); // Microsoft Teams implementation not provided
      default:
        return null; // No matching platform found
    }
  }
}
