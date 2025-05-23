var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class Chrome {
  constructor() {
    __publicField(this, "name", "Chrome");
  }
  get(keys, area = "local") {
    return new Promise((resolve, reject) => {
      chrome.storage[area].get(keys, (result) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(result);
      });
    });
  }
  set(items, area = "local") {
    return new Promise((resolve, reject) => {
      chrome.storage[area].set(items, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }
  remove(keys, area = "local") {
    return new Promise((resolve, reject) => {
      chrome.storage[area].remove(keys, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }
  /**
   * Injects a local script from the extension into the DOM.
   *
   * @param fileName - The filename of the script in the extension
   * @param onLoad - Optional callback executed after the script is loaded
   */
  inject(fileName, onLoad = () => {
  }) {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(fileName);
    script.type = "text/javascript";
    script.onload = onLoad;
    (document.head || document.documentElement).appendChild(script);
  }
}
function detectBrowser() {
  console.log("Detecting browser...");
  const userAgent = navigator.userAgent;
  if (/Chrome\//.test(userAgent)) {
    return new Chrome();
  }
  return new Chrome();
}
const CONFIGURATION_KEY = "configuration";
class ConfigurationManager {
  constructor(browserStorage) {
    this.browserStorage = browserStorage;
    this.setConfig({
      user: {
        token: "",
        userId: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
        fullName: "Mohammad Karimi",
        pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
      },
      service: {
        webhookUrl: "https://au5.ai/api/v1/",
        direction: "rtl",
        hubUrl: "https://localhost:7061/meetinghub"
      },
      extension: {
        meetingEndIcon: {
          selector: ".google-symbols",
          text: "call_end"
        },
        captionsIcon: {
          selector: ".google-symbols",
          text: "closed_caption_off"
        },
        transcriptSelectors: {
          aria: 'div[role="region"][tabindex="0"]',
          fallback: ".a4cQT"
        },
        transcriptStyles: {
          opacity: "0.2"
        },
        maxTranscriptLength: 250,
        transcriptTrimThreshold: 125
      }
    });
  }
  /**
   * Retrieves the entire configuration object from storage.
   */
  async getConfig() {
    try {
      const config = await this.browserStorage.get(CONFIGURATION_KEY);
      return config ?? null;
    } catch (error) {
      console.error("Failed to load configuration:", error);
      throw new Error("Configuration not found.");
    }
  }
  /**
   * Updates the entire configuration object in storage.
   */
  async setConfig(config) {
    try {
      await this.browserStorage.set({ [CONFIGURATION_KEY]: config }, "local");
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  }
  /**
   * Gets a single config field like webhookUrl or token.
   */
  async getValue(key) {
    const config = await this.getConfig();
    return config ? config[key] : null;
  }
  /**
   * Updates only one key of the configuration.
   */
  async setValue(key, value) {
    const config = await this.getConfig() || {};
    config[key] = value;
    await this.setConfig(config);
  }
  /**
   * Removes the entire configuration.
   */
  async clearConfig() {
    try {
      await this.browserStorage.remove(CONFIGURATION_KEY);
    } catch (error) {
      console.error("Failed to clear configuration:", error);
    }
  }
}
function getMeetingPlatform(url) {
  const patterns = {
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
class GoogleMeet {
  constructor(url) {
    this.url = url;
  }
  getMeetingTitle() {
    const match = this.url.match(/meet\.google\.com\/([a-zA-Z0-9-]+)/);
    return match ? `Google Meet (${match[1]})` : "Google Meet";
  }
}
class Zoom {
  constructor(url) {
    this.url = url;
  }
  getMeetingTitle() {
    const match = this.url.match(/zoom\.us\/(j|my)\/([a-zA-Z0-9]+)/);
    return match ? `Zoom (${match[2]})` : "Zoom";
  }
}
class MicrosoftTeams {
  constructor(url) {
    this.url = url;
  }
  getMeetingTitle() {
    return "Microsoft Teams";
  }
}
function createMeetingPlatformInstance(url) {
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
export {
  ConfigurationManager as C,
  createMeetingPlatformInstance as c,
  detectBrowser as d
};
