import {IMeetingPlatform, platformRegex} from "../types";

export class GoogleMeet implements IMeetingPlatform {
  constructor(private url: string) {}
  getMeetingId(): string {
    const match = this.url.match(platformRegex.googleMeet);
    return match ? `${match[1]}` : "Google Meet";
  }

  getPlatformName(): string {
    return "GoogleMeet";
  }
}
