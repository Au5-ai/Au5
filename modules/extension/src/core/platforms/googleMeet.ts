import {IMeetingPlatform} from "../types";

export class GoogleMeet implements IMeetingPlatform {
  constructor(private url: string) {}
  getMeetingId(): string {
    const match = this.url.match(/meet\.google\.com\/([a-zA-Z0-9-]+)/);
    return match ? `${match[1]}` : "Google Meet";
  }

  getPlatformName(): string {
    return "GoogleMeet";
  }
}
