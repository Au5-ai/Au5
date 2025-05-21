var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const MeetingHubConfig = {
  hubUrl: "https://localhost:7061/meetinghub",
  receiveMethod: "ReceiveMessage",
  messageSources: {
    injectedScript: "Au5-InjectedScript",
    contentScript: "Au5-ContentScript"
  },
  contentScriptActions: {
    TRANSCRIPTION_UPDATE: "RealTimeTranscription",
    PARTICIPANT_JOINED: "SomeoneIsJoining",
    TRANSCRIPTION_STARTED: "StartTranscription",
    MeedHasBeenStarted: "MeetingHasStarted"
  },
  injectedScriptActions: {
    SET_MEETING_TITLE: "MeetingTitle",
    REQUEST_TRANSCRIPTION: "StartTranscription",
    SEND_TRANSCRIPTION: "RealTimeTranscription"
  },
  defaultMeetingId: "NA"
};
async function pipeAsync(input, ...fns) {
  let result = input;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
}
const CONFIGURATION_KEY = "configuration";
class ConfigurationService {
  constructor(storageService) {
    this.storageService = storageService;
  }
  /**
   * Retrieves the entire configuration object from storage.
   */
  async getConfig() {
    try {
      return DefaultAppConfig;
      const config = await this.storageService.get(CONFIGURATION_KEY);
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
      await this.storageService.set(CONFIGURATION_KEY, config);
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
      await this.storageService.remove(CONFIGURATION_KEY);
    } catch (error) {
      console.error("Failed to clear configuration:", error);
    }
  }
}
const ExtensionConfig = {
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
};
const DefaultAppConfig = {
  Service: {
    webhookUrl: "https://au5.ai/api/v1/",
    token: "",
    userId: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
    fullName: "Mohammad Karimi",
    direction: "rtl"
  },
  Extension: ExtensionConfig
};
class StorageService {
  async remove(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }
  async set(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(value);
      });
    });
  }
  async get(keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keyArray, (result) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(result);
      });
    });
  }
  async getSync(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], (result) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(result);
      });
    });
  }
}
class SidePanel {
  static createSidePanel(roomName, meetingId, direction = "ltr") {
    this.direction = direction;
    const style = document.createElement("style");
    style.textContent = chatPanelStyle;
    document.head.appendChild(style);
    const html = `
        <div class="au5-panel">
          <div class="au5-header">
            <div class="au5-header-left">
              <div>
                <div class="au5-room-name">${roomName}</div>
                <div class="au5-member-count">${meetingId}</div>
              </div>
            </div>
            <div class="au5-header-icons">
              <span class="au5-icon" id="au5-headerIcon-pause"> 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.65 19.11V4.89C10.65 3.54 10.08 3 8.64 3H5.01C3.57 3 3 3.54 3 4.89V19.11C3 20.46 3.57 21 5.01 21H8.64C10.08 21 10.65 20.46 10.65 19.11Z"
                    stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 19.11V4.89C21 3.54 20.43 3 18.99 3H15.36C13.93 3 13.35 3.54 13.35 4.89V19.11C13.35 20.46 13.92 21 15.36 21H18.99C20.43 21 21 20.46 21 19.11Z"
                    stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="au5-icon" id="au5-headerIcon-collapse"> 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2V22M18 22H6C3.79086 22 2 20.2091 2 18V6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22Z"
                    stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
      
          <div class="au5-participants-container au5-container"></div>
          <div class="au5-messages-container au5-container au5-hidden"></div>
          <div class="au5-footer">
            <button class="au5-start-btn au5-btn">Start Transcription</button>

            <div class="au5-input-wrapper au5-hidden">
              <div class="au5-input-container">
                <input type="text" class="au5-input" placeholder="پیام خود را بنویسید..." />
                <button class="au5-send-btn">ارسال</button>
              </div>
            </div>
          </div>
        </div>
      `;
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    this.panelElement = container.querySelector(".au5-panel");
    this.messagesContainer = container.querySelector(".au5-messages-container");
    this.participantsContainer = container.querySelector(".au5-participants-container");
    this.btnStartTranscription = container.querySelector(".au5-start-btn");
    this.inputWrapper = container.querySelector(".au5-input-wrapper");
    const pauseButton = container.querySelector("#au5-headerIcon-pause");
    const collapseButton = container.querySelector("#au5-headerIcon-collapse");
    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        console.log("Pause icon clicked");
      });
    }
    if (collapseButton) {
      collapseButton.addEventListener("click", () => {
        console.log("Collapse icon clicked");
      });
    }
  }
  static showMessagesContainer() {
    var _a, _b, _c;
    if (this.messagesContainer) {
      this.messagesContainer.classList.remove("au5-hidden");
      (_a = this.participantsContainer) == null ? void 0 : _a.classList.add("au5-hidden");
      (_b = this.inputWrapper) == null ? void 0 : _b.classList.remove("au5-hidden");
      (_c = this.btnStartTranscription) == null ? void 0 : _c.classList.add("au5-hidden");
    }
  }
  static destroy() {
    if (this.panelElement) {
      document.body.removeChild(this.panelElement);
      this.panelElement = null;
      this.messagesContainer = null;
    } else {
      console.warn("SidePanel not found.");
    }
  }
}
__publicField(SidePanel, "panelElement", null);
__publicField(SidePanel, "messagesContainer", null);
__publicField(SidePanel, "participantsContainer", null);
__publicField(SidePanel, "btnStartTranscription", null);
__publicField(SidePanel, "inputWrapper", null);
__publicField(SidePanel, "direction", "ltr");
const chatPanelStyle = `
   /* Additional styles can be added here */
body {
  background-color: #333;
  font-family: system-ui;
}
.au5-panel {
  background-color: #fff;
  border-radius: 16px;
  bottom: 80px;
  box-sizing: border-box;
  max-width: 100%;
  position: absolute;
  right: 16px;
  top: 16px;
  transform: none;
  z-index: 9999;
  width: 360px;
  font-family: system-ui;
}

.au5-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.au5-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.au5-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.au5-avatar img {
  border-radius: 50%;
  width: 36px;
  height: 36px;
}

.au5-room-name {
  font-weight: bold;
  font-size: 14px;
}

.au5-member-count {
  font-size: 12px;
  color: #888;
}

.au5-header-icons {
  display: flex;
  gap: 8px;
}

.au5-header-icons .au5-icon {
  font-size: 16px;
  display: flex;
  cursor: pointer;
  border-radius: 4px;
  width: 28px;
  background-color: #f4f4f4f4;
  height: 28px;
  align-items: center;
  justify-content: center;
}

.au5-container {
  height: calc(100vh - 249px);
  overflow-y: auto;
  padding: 16px;
}

.au5-message {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 12px;
  position: relative;
}

.au5-bubble {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 8px 12px;
  flex: 1;
}

.au5-sender {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.au5-sender-title {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
}

.au5-text {
  font-size: 13px;
  margin-bottom: 16px;
  direction: rtl;
}

.au5-sender-time {
  font-size: 11px;
  color: #888;
  text-align: right;
}

.au5-message-reactions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.au5-reactions {
  display: flex;
  gap: 4px;
  left: 48px;
  bottom: 8px;
}

.au5-reactions .reaction {
  display: flex;
  gap: 4px;
  padding: 1px;
  border-radius: 100px;
  cursor: pointer;
  border: 1px solid #e5e5e5;
  transition: background-color 0.2s;
  background-color: #e4e4e4;
  align-items: center;
  align-content: center;
  min-width: 16px;
  max-height: 16px;
}

.au5-reactions .reaction-emoji {
  font-size: 12px;
  width: 16px;
  height: 16px;
}

.au5-reactions .reaction-users {
  display: flex;
  margin-left: 2px;
}

.au5-reactions .reaction-user {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid white;
  margin-left: -4px;
  display: flex;
}

.au5-reactions .reaction-user img {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.au5-btn {
  background: #2196f3;
  border: none;
  color: white;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 8px;
  height: 38px;
  margin-left: 8px;
  cursor: pointer;
  font-family: system-ui;
  width: -webkit-fill-available;
}

.au5-join-time {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin: 16px 0;
}

.au5-input-wrapper {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
}

.au5-input-container {
  display: flex;
  align-items: center;
  flex: 1;
  border: 1px solid #f4f4f4;
  padding: 6px;
  border-radius: 8px;
}

.au5-input {
  flex: 1;
  border: none;
  font-size: 14px;
  padding: 8px;
  border-radius: 8px;
  outline: none;
  font-family: system-ui;
}

.au5-hidden {
  display: none;
}

.au5-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px 16px;
}

`;
async function waitForMatch(selector, text) {
  const matchesText = (el) => {
    var _a;
    return text ? ((_a = el.textContent) == null ? void 0 : _a.trim()) === text : true;
  };
  while (true) {
    const elements = Array.from(document.querySelectorAll(selector));
    const matched = elements.find(matchesText);
    if (matched instanceof HTMLElement) return matched;
    await new Promise(requestAnimationFrame);
  }
}
function selectSingle(selector) {
  return document.querySelector(selector);
}
function selectAll(selector, textPattern) {
  const elements = Array.from(document.querySelectorAll(selector));
  if (!textPattern) return elements;
  const regex = new RegExp(textPattern);
  return elements.filter((el) => regex.test(el.textContent ?? ""));
}
function setOpacity(container, applyToSelf, opacity) {
  if (applyToSelf) {
    container.style.opacity = opacity;
  } else {
    const target = container.children[1];
    target == null ? void 0 : target.style.setProperty("opacity", opacity);
  }
}
function getDomContainer(ariaSelector, fallbackSelector) {
  const container = document.querySelector(ariaSelector);
  if (container) return { container, usedAria: true };
  return {
    container: document.querySelector(fallbackSelector),
    usedAria: false
  };
}
function injectScript(fileName, onLoad = () => {
}) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(fileName);
  script.type = "text/javascript";
  script.onload = onLoad;
  (document.head || document.documentElement).appendChild(script);
}
let appConfig;
const configService = new ConfigurationService(new StorageService());
let hasMeetingEnded = false;
let transcriptBlocks = [];
let currentSpeakerId = "", currentSpeakerName = "", currentTranscript = "", currentTimestamp = "";
let transcriptObserver;
const activateCaptions = async (ctx) => {
  var _a;
  const captionsIcon = appConfig.Extension.captionsIcon;
  ctx.captionsButton = selectAll(captionsIcon.selector, captionsIcon.text)[0];
  (_a = ctx.captionsButton) == null ? void 0 : _a.click();
  return ctx;
};
const findTranscriptContainer = async (ctx) => {
  const dom = getDomContainer(
    appConfig.Extension.transcriptSelectors.aria,
    appConfig.Extension.transcriptSelectors.fallback
  );
  if (!dom) throw new Error("Transcript container not found in DOM");
  ctx.transcriptContainer = dom.container;
  ctx.canUseAriaBasedTranscriptSelector = dom.usedAria;
  return ctx;
};
const applyTranscriptStyle = async (ctx) => {
  if (ctx.transcriptContainer) {
    setOpacity(
      ctx.transcriptContainer,
      ctx.canUseAriaBasedTranscriptSelector,
      appConfig.Extension.transcriptStyles.opacity
    );
  }
  return ctx;
};
const observeTranscriptContainer = async (ctx) => {
  if (ctx.transcriptContainer) {
    transcriptObserver = new MutationObserver(createMutationHandler(ctx));
    transcriptObserver.observe(ctx.transcriptContainer, {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true
    });
  }
  return ctx;
};
const finalizeMeetingRoutines = async (ctx) => {
  endMeetingRoutines();
  return ctx;
};
async function startMeetingRoutines() {
  try {
    appConfig = await configService.getConfig();
    await waitForMatch(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}
function startPipeline() {
  return pipeAsync(
    {
      hasMeetingStarted: true
    },
    activateCaptions,
    findTranscriptContainer,
    applyTranscriptStyle,
    observeTranscriptContainer,
    finalizeMeetingRoutines
  );
}
function getMeetingTitleFromUrl() {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const meetingId = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "N/A";
  return meetingId;
}
startMeetingRoutines().then(async () => {
  var _a;
  SidePanel.createSidePanel("Asax Co", getMeetingTitleFromUrl(), appConfig.Service.direction);
  injectScript("injected.js");
  (_a = document.getElementById("au5-start-button")) == null ? void 0 : _a.addEventListener("click", () => {
    startPipeline();
    window.postMessage(
      {
        source: MeetingHubConfig.messageSources.contentScript,
        action: MeetingHubConfig.contentScriptActions.TRANSCRIPTION_STARTED,
        payload: {
          userid: appConfig.Service.userId
        }
      },
      "*"
    );
  });
}).catch((error) => {
  console.error("Meeting routine execution failed:", error);
});
function createMutationHandler(ctx) {
  return function(mutations, observer) {
    handleTranscriptMutations(mutations, ctx);
  };
}
function handleTranscriptMutations(mutations, ctx) {
  var _a, _b, _c, _d;
  for (const _ of mutations) {
    try {
      const transcriptContainer = ctx.canUseAriaBasedTranscriptSelector ? selectSingle(appConfig.Extension.transcriptSelectors.aria) : selectSingle(appConfig.Extension.transcriptSelectors.fallback);
      const speakerElements = ctx.canUseAriaBasedTranscriptSelector ? transcriptContainer == null ? void 0 : transcriptContainer.children : (_b = (_a = transcriptContainer == null ? void 0 : transcriptContainer.childNodes[1]) == null ? void 0 : _a.firstChild) == null ? void 0 : _b.childNodes;
      if (!speakerElements) return;
      const hasSpeakers = ctx.canUseAriaBasedTranscriptSelector ? speakerElements.length > 1 : speakerElements.length > 0;
      if (!hasSpeakers) {
        if (currentSpeakerName && currentTranscript) {
          flushTranscriptBuffer({
            speaker: currentSpeakerName,
            transcript: currentTranscript,
            timestamp: currentTimestamp
          });
        }
        currentSpeakerId = "";
        currentSpeakerName = "";
        currentTranscript = "";
        continue;
      }
      const latestSpeakerElement = ctx.canUseAriaBasedTranscriptSelector ? speakerElements[speakerElements.length - 2] : speakerElements[speakerElements.length - 1];
      const nameNode = latestSpeakerElement.childNodes[0];
      const textNode = latestSpeakerElement.childNodes[1];
      const speakerName = ((_c = nameNode == null ? void 0 : nameNode.textContent) == null ? void 0 : _c.trim()) ?? "";
      const transcriptText = ((_d = textNode == null ? void 0 : textNode.textContent) == null ? void 0 : _d.trim()) ?? "";
      if (!speakerName || !transcriptText) {
        continue;
      }
      if (currentTranscript === "") {
        currentSpeakerId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = (/* @__PURE__ */ new Date()).toISOString();
        currentTranscript = transcriptText;
      } else if (currentSpeakerName !== speakerName) {
        flushTranscriptBuffer({
          id: currentSpeakerId,
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        });
        currentSpeakerId = crypto.randomUUID();
        currentSpeakerName = speakerName;
        currentTimestamp = (/* @__PURE__ */ new Date()).toISOString();
        currentTranscript = transcriptText;
      } else {
        if (ctx.canUseAriaBasedTranscriptSelector) {
          const textDiff = transcriptText.length - currentTranscript.length;
          if (textDiff < -appConfig.Extension.maxTranscriptLength) {
            flushTranscriptBuffer({
              id: currentSpeakerId,
              speaker: currentSpeakerName,
              transcript: currentTranscript,
              timestamp: currentTimestamp
            });
          }
        }
        currentTranscript = transcriptText;
        if (!ctx.canUseAriaBasedTranscriptSelector && transcriptText.length > appConfig.Extension.maxTranscriptLength) {
          latestSpeakerElement.remove();
        }
      }
      window.postMessage(
        {
          source: MeetingHubConfig.messageSources.contentScript,
          action: MeetingHubConfig.contentScriptActions.TRANSCRIPTION_UPDATE,
          payload: {
            id: currentSpeakerId,
            speaker: currentSpeakerName,
            transcript: currentTranscript,
            timestamp: currentTimestamp
          }
        },
        "*"
      );
    } catch (err) {
      console.error(err);
      if (!hasMeetingEnded) {
        console.log("Error in transcript mutation observer:", err);
      }
    }
  }
}
function flushTranscriptBuffer(item) {
  if (!currentTranscript || !currentTimestamp) return;
  const name = item.speaker === "You" ? appConfig.Service.fullName : item.speaker;
  transcriptBlocks.push({
    id: item.id,
    speaker: name,
    timestamp: item.timestamp,
    transcript: item.transcript
  });
}
function endMeetingRoutines() {
  var _a, _b;
  try {
    const elements = selectAll(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
    const meetingEndButton = ((_b = (_a = elements == null ? void 0 : elements[0]) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.parentElement) ?? null;
    if (!meetingEndButton) {
      throw new Error("Meeting end button not found in DOM.");
    }
    meetingEndButton.addEventListener("click", () => {
      hasMeetingEnded = true;
      transcriptObserver == null ? void 0 : transcriptObserver.disconnect();
      if (currentSpeakerName && currentTranscript) {
        flushTranscriptBuffer({
          speaker: currentSpeakerName,
          transcript: currentTranscript,
          timestamp: currentTimestamp
        });
      }
      SidePanel.destroy();
      console.log("Meeting ended. Transcript data:", JSON.stringify(transcriptBlocks));
    });
  } catch (err) {
    console.error("Error setting up meeting end listener:", err);
  }
}
window.addEventListener("message", (event) => {
  const { data, source } = event;
  if (source !== window || (data == null ? void 0 : data.source) !== MeetingHubConfig.messageSources.injectedScript) {
    return;
  }
  const { action, payload } = data;
  switch (action) {
    case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_UPDATE:
      break;
    case MeetingHubConfig.contentScriptActions.PARTICIPANT_JOINED:
      break;
    case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_STARTED:
      break;
    case MeetingHubConfig.contentScriptActions.MeedHasBeenStarted:
      console.log("Meeting has started");
      SidePanel.showMessagesContainer();
      break;
    default:
      console.warn("Unknown message action received:", action);
  }
});
