import { platformRegex } from "../types";
export class GoogleMeet {
    url;
    constructor(url) {
        this.url = url;
    }
    getMeetingId() {
        const match = this.url.match(platformRegex.googleMeet);
        return match ? `${match[1]}` : "Google Meet";
    }
    getPlatformName() {
        return "GoogleMeet";
    }
}
