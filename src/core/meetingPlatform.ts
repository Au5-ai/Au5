import {IMeetingPlatform} from "./types";

function getMeetingPlatform(url: string): string | null {
  const patterns: {[key: string]: RegExp} = {
    "Google Meet": /https?:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/,
    Zoom: /https?:\/\/([a-z0-9]+\.)?zoom\.us\/(j|my)\/[a-zA-Z0-9?&=]+/,
    "Microsoft Teams": /https?:\/\/(teams\.microsoft\.com|teams\.live\.com)\/[a-zA-Z0-9/?&=._-]+/
  };

  for (const [platform, pattern] of Object.entries(patterns)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return null;
}

export class GoogleMeet implements IMeetingPlatform {
  constructor(private url: string) {}
  getMeetingTitle(): string {
    // Example: https://meet.google.com/abc-defg-hij
    const match = this.url.match(/meet\.google\.com\/([a-zA-Z0-9-]+)/);
    return match ? `${match[1]}` : "Google Meet";
  }

  getPlatformName(): string {
    return "GoogleMeet";
  }
}

export class Zoom implements IMeetingPlatform {
  constructor(private url: string) {}
  getMeetingTitle(): string {
    // Example: https://zoom.us/j/123456789
    const match = this.url.match(/zoom\.us\/(j|my)\/([a-zA-Z0-9]+)/);
    return match ? `${match[2]}` : "Zoom";
  }

  getPlatformName(): string {
    return "Zoom";
  }
}

export class MicrosoftTeams implements IMeetingPlatform {
  constructor(private url: string) {}
  getMeetingTitle(): string {
    // Example: https://teams.microsoft.com/l/meetup-join/...
    return "Microsoft Teams";
  }

  getPlatformName(): string {
    return "Microsoft Teams";
  }
}

export function createMeetingPlatformInstance(url: string): IMeetingPlatform | null {
  const platform = getMeetingPlatform(url);
  if (!platform) return null;
  switch (platform) {
    case "Google Meet":
      return new GoogleMeet(url);
    case "Zoom":
      return new Zoom(url);
    case "Microsoft Teams":
      return new MicrosoftTeams(url);
    default:
      return null;
  }
}
