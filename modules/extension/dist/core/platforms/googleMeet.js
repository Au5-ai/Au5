export class GoogleMeet {
    url;
    constructor(url) {
        this.url = url;
    }
    getMeetingId() {
        const match = this.url.match(/meet\.google\.com\/([a-zA-Z0-9-]+)/);
        return match ? `${match[1]}` : "Google Meet";
    }
    getPlatformName() {
        return "GoogleMeet";
    }
}
