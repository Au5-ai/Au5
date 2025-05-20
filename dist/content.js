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
    TRANSCRIPTION_STARTED: "StartTranscription"
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
function toHoursAndMinutes(isoString) {
  const date = new Date(isoString);
  const hh = date.getUTCHours().toString().padStart(2, "0");
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
class ChatPanel {
  static createPanel(direction = "ltr") {
    if (this.panel) {
      console.warn("ChatPanel already exists.");
      return;
    }
    const style = document.createElement("style");
    style.textContent = chatPanelStyle;
    document.head.appendChild(style);
    if (document.getElementById("au5-chat-panel")) return;
    this.panel = document.createElement("div");
    this.panel.id = "au5-chat-panel";
    this.panel.className = "au5-chat-panel";
    this.panel.setAttribute("data-direction", direction);
    document.body.appendChild(this.panel);
  }
  static hideParticipantList() {
    var _a;
    (_a = this.participantContainer) == null ? void 0 : _a.classList.add("au5-hidden");
  }
  static addCurrentUser(name) {
    if (!this.panel) {
      console.warn("ChatPanel not initialized.");
      return;
    }
    this.participantContainer = document.createElement("div");
    this.participantContainer.className = "au5-participant";
    this.participantContainer.innerHTML = `
      <ul class="au5-participant-list">
        <li>${name}</li>
      </ul>
      <button id="au5-start-button">Start Transcription</button>
    `;
    this.panel.appendChild(this.participantContainer);
  }
  static addParticipant(name) {
    if (!this.panel || !this.participantContainer) {
      console.warn("ChatPanel or participant container not initialized.");
      return;
    }
    const list = this.participantContainer.querySelector(".au5-participant-list");
    if (list) {
      const li = document.createElement("li");
      li.innerText = name;
      list.appendChild(li);
    }
  }
  static addMessage({ id, speaker, transcript, timestamp }) {
    if (!this.panel) return;
    const direction = this.panel.getAttribute("data-direction") || "ltr";
    const message = document.createElement("div");
    message.className = "au5-message";
    message.setAttribute("data-id", id);
    message.innerHTML = `
      <div class="au5-message-header">
        <span class="au5-message-sender">${speaker}</span>
        <span class="au5-message-time">${toHoursAndMinutes(timestamp)}</span>
      </div>
      <div class="au5-message-text" style="direction: ${direction};">${transcript}</div>
    `;
    this.panel.appendChild(message);
  }
  static updateLiveMessage(item) {
    if (!this.panel) {
      console.warn("ChatPanel not initialized.");
      return;
    }
    const existing = this.panel.querySelector(`[data-id="${item.id}"]`);
    if (existing) {
      const textEl = existing.querySelector(".au5-message-text");
      if (textEl) textEl.innerText = item.transcript;
    } else {
      this.addMessage(item);
    }
  }
  static destroy() {
    if (this.panel) {
      document.body.removeChild(this.panel);
      this.panel = null;
      this.participantContainer = null;
    } else {
      console.warn("ChatPanel not found.");
    }
  }
}
__publicField(ChatPanel, "panel", null);
__publicField(ChatPanel, "participantContainer", null);
const chatPanelStyle = `
  .au5-chat-panel {
    border: 1px solid transparent;
    align-items: center;
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
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    width: 360px;
    padding: 16px;
    overflow-x: auto;
    font-family: system-ui;
  }

  #au5-start-button {
    background-color: rgb(0, 0, 0);
    color: white; 
    border-radius: 8px; 
    padding: 8px; 
    border: none; 
    cursor: pointer;
  }

  .au5-message {
    background-color: #f1f2f3;
    padding: 16px;
    border-radius: 16px;
    max-width: 500px;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.6;
    color: #000;
  }

  .au5-message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .au5-message-sender {
    font-weight: bold;
    font-size: 13px;
  }

  .au5-message-time {
    color: #333;
    font-size: 13px;
  }

  .au5-message-text {
    margin-bottom: 8px;
  }

  .au5-hidden {
    display: none;
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
startMeetingRoutines().then(async () => {
  var _a;
  ChatPanel.createPanel(appConfig.Service.direction);
  ChatPanel.addCurrentUser(appConfig.Service.fullName);
  (_a = document.getElementById("au5-start-button")) == null ? void 0 : _a.addEventListener("click", () => {
    ChatPanel.hideParticipantList();
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
  injectScript("injected.js");
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
      ChatPanel.updateLiveMessage({
        id: currentSpeakerId,
        speaker: currentSpeakerName,
        transcript: currentTranscript,
        timestamp: currentTimestamp
      });
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
      ChatPanel.destroy();
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
      ChatPanel.updateLiveMessage(payload);
      break;
    case MeetingHubConfig.contentScriptActions.PARTICIPANT_JOINED:
      ChatPanel.addParticipant(payload);
      break;
    case MeetingHubConfig.contentScriptActions.TRANSCRIPTION_STARTED:
      ChatPanel.hideParticipantList();
      break;
    default:
      console.warn("Unknown message action received:", action);
  }
});
