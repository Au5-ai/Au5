var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class ChatPanel {
  constructor(companyNameText, roomTitleText) {
    __publicField(this, "noActiveMeetingEl");
    __publicField(this, "activeMeetingButNotStartedEl");
    __publicField(this, "activeMeetingEl");
    this.addHeader(companyNameText, roomTitleText);
    this.noActiveMeetingEl = document.getElementById("au5-noActiveMeeting");
    this.activeMeetingButNotStartedEl = document.getElementById("au5-activeMeetingButNotStarted");
    this.activeMeetingEl = document.getElementById("au5-activeMeeting");
  }
  showJoinMeeting() {
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.add("au5-hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.remove("au5-hidden");
    if (this.activeMeetingEl) this.activeMeetingEl.classList.add("au5-hidden");
  }
  showNoActiveMeeting() {
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.remove("au5-hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.add("au5-hidden");
    if (this.activeMeetingEl) this.activeMeetingEl.classList.add("au5-hidden");
  }
  addHeader(companyNameText, roomTitleText) {
    const headerElement = document.querySelector(".au5-header");
    if (!headerElement) return;
    const headerLeft = document.createElement("div");
    headerLeft.className = "au5-header-left";
    const companyAvatar = document.createElement("div");
    companyAvatar.className = "au5-company-avatar";
    companyAvatar.textContent = "A";
    const infoContainer = document.createElement("div");
    const companyName = document.createElement("div");
    companyName.className = "au5-company-name";
    companyName.textContent = companyNameText;
    const roomTitle = document.createElement("div");
    roomTitle.className = "au5-room-title";
    roomTitle.textContent = roomTitleText;
    infoContainer.appendChild(companyName);
    infoContainer.appendChild(roomTitle);
    headerLeft.appendChild(companyAvatar);
    headerLeft.appendChild(infoContainer);
    headerElement.appendChild(headerLeft);
  }
}
class GoogleMeet {
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
class MeetingPlatformFactory {
  constructor(url) {
    __publicField(this, "_url");
    this._url = url;
  }
  /**
   * Returns an instance of a meeting platform based on the URL.
   * Currently supports Google Meet, Zoom, and Microsoft Teams.
   * @returns {IMeetingPlatform | null} An instance of the meeting platform or null if not recognized.
   */
  getPlatform() {
    let platformName = null;
    const patterns = {
      "Google Meet": /https?:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/
    };
    for (const [platform2, pattern] of Object.entries(patterns)) {
      if (pattern.test(this._url)) {
        platformName = platform2;
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
        return null;
    }
  }
}
function getCurrentUrl() {
  return new Promise((resolve) => {
    let currentUrl = window.location.href;
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
          resolve(tabs[0].url);
        } else {
          resolve(currentUrl);
        }
      });
    } else {
      resolve(currentUrl);
    }
  });
}
let platform;
let chatPanel = null;
(() => {
  getCurrentUrl().then((url) => {
    platform = new MeetingPlatformFactory(url).getPlatform();
    if (!platform) {
      console.log("Platform detected:", url);
      chatPanel = new ChatPanel("Asa Co", "No Active Meeting");
      chatPanel.showNoActiveMeeting();
    } else {
      chatPanel = new ChatPanel("Asa Co", platform.getMeetingId());
      chatPanel.showJoinMeeting();
    }
  });
})();
