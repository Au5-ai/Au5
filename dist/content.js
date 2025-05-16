var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
const HubConnectionConfig = {
  hubUrl: "https://localhost:7061/meetinghub",
  methodName: "ReceiveMessage",
  toContentScript: {
    source: "Au5-InjectedScript",
    actions: {
      realTimeTranscription: "RealTimeTranscription",
      someoneIsJoining: "SomeoneIsJoining",
      startTranscription: "StartTranscription"
    }
  },
  fromContentScropt: {
    source: "Au5-ContentScript",
    actions: {
      meetingTitle: "MeetingTitle",
      startTranscription: "StartTranscription",
      realTimeTranscription: "RealTimeTranscription"
    }
  },
  meetingId: "NA"
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
function toHoursAndMinutes(isoString) {
  const date = new Date(isoString);
  const hh = date.getUTCHours().toString().padStart(2, "0");
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
const _ChatPanel = class _ChatPanel {
  static addPanel(direction) {
    if (this.chatPanel) {
      console.warn("ChatPanel already exists.");
      return;
    }
    const style = document.createElement("style");
    style.textContent = chatPanelStyle;
    document.head.appendChild(style);
    if (document.getElementById("au5-chat-panel")) return;
    this.chatPanel = document.createElement("div");
    this.chatPanel.id = "au5-chat-panel";
    this.chatPanel.className = "au5-chat-panel";
    this.chatPanel.setAttribute("data-direction", direction);
    document.body.appendChild(this.chatPanel);
  }
  static addYou(name) {
    if (!this.chatPanel) {
      console.warn("ChatPanel does not exist.");
      return;
    }
    this.participants = document.createElement("div");
    this.participants.className = "au5-participant";
    this.participants.innerHTML = `
        <ul class="au5-participant-list">
          <li>${{ name }}</li>
        </ul>

      <button id="au5-start-button">Start Transcription</button>
`;
    this.chatPanel.appendChild(this.participants);
  }
  static addOthers(name) {
    var _a;
    if (!this.chatPanel) {
      console.warn("ChatPanel does not exist.");
      return;
    }
    const participantList = (_a = this.participants) == null ? void 0 : _a.getElementsByClassName(`au5-participant-list"`)[0];
    if (participantList) {
      const other = document.createElement("li");
      other.innerText = name;
      participantList.appendChild(other);
    }
  }
  static addMessage(item) {
    if (!this.chatPanel) {
      return;
    }
    const direction = this.chatPanel.getAttribute("data-direction") || "ltr";
    const message = document.createElement("div");
    message.className = "au5-message";
    message.setAttribute("data-id", item.id);
    message.innerHTML = `
    <div class="au5-message-header">
      <span class="au5-message-sender">${item.speaker}</span>
      <span class="au5-message-time">${toHoursAndMinutes(item.timestamp)}</span>
    </div>
    <div class="au5-message-text" style="direction: ${direction};">${item.transcript}</div>
  `;
    this.chatPanel.appendChild(message);
  }
  static addLiveMessage(item) {
    if (!this.chatPanel) {
      console.warn("ChatPanel does not exist.");
      return;
    }
    const existingMessage = this.chatPanel.querySelector(`[data-id="${item.id}"]`);
    if (existingMessage) {
      const textDiv = existingMessage.querySelector(".au5-message-text");
      if (textDiv) {
        textDiv.innerText = item.transcript;
      }
    } else {
      _ChatPanel.addMessage(item);
    }
  }
  static destroy() {
    if (this.chatPanel) {
      document.body.removeChild(this.chatPanel);
      this.chatPanel = null;
    } else {
      console.warn("ChatPanel does not exist.");
    }
  }
};
__publicField(_ChatPanel, "chatPanel", null);
__publicField(_ChatPanel, "participants", null);
let ChatPanel = _ChatPanel;
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
`;
async function waitForElement(selector, text) {
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
function selectElement(selector) {
  return document.querySelector(selector);
}
function selectElements(selector, text) {
  const elements = Array.from(document.querySelectorAll(selector));
  if (!text) return elements;
  const regex = new RegExp(text);
  return elements.filter((el) => regex.test(el.textContent ?? ""));
}
function applyDomStyle(container, useAriaSelector, opacity) {
  if (useAriaSelector) {
    container.style.opacity = opacity;
  } else {
    const secondChild = container.children[1];
    secondChild == null ? void 0 : secondChild.setAttribute("style", `opacity: ${opacity};`);
  }
}
function findDomContainer(ariaSelector, fallbackSelector) {
  let container = document.querySelector(ariaSelector);
  const useAria = !!container;
  if (!container) {
    container = document.querySelector(fallbackSelector);
  }
  return { container, useAria };
}
let appConfig;
const configService = new ConfigurationService(new StorageService());
let hasMeetingEnded = false;
let transcriptBlocks = [];
let currentSpeakerId = "", currentSpeakerName = "", currentTranscript = "", currentTimestamp = "";
let isTranscriptDomErrorCaptured = false;
let transcriptObserver;
const activateCaptions = async (ctx) => {
  var _a;
  const captionsIcon = appConfig.Extension.captionsIcon;
  ctx.captionsButton = selectElements(captionsIcon.selector, captionsIcon.text)[0];
  (_a = ctx.captionsButton) == null ? void 0 : _a.click();
  return ctx;
};
const findTranscriptContainer = async (ctx) => {
  const dom = findDomContainer(
    appConfig.Extension.transcriptSelectors.aria,
    appConfig.Extension.transcriptSelectors.fallback
  );
  if (!dom) throw new Error("Transcript container not found in DOM");
  ctx.transcriptContainer = dom.container;
  ctx.canUseAriaBasedTranscriptSelector = dom.useAria;
  return ctx;
};
const applyTranscriptStyle = async (ctx) => {
  if (ctx.transcriptContainer) {
    applyDomStyle(
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
async function startMeetingRoutines(browserService2) {
  try {
    appConfig = await configService.getConfig();
    await waitForElement(appConfig.Extension.meetingEndIcon.selector, appConfig.Extension.meetingEndIcon.text);
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
  ChatPanel.addPanel(appConfig.Service.direction);
  ChatPanel.addYou(appConfig.Service.fullName);
  (_a = document.getElementById("au5-start-button")) == null ? void 0 : _a.addEventListener("click", () => {
    startPipeline();
    window.postMessage(
      {
        source: HubConnectionConfig.fromContentScropt.source,
        action: HubConnectionConfig.fromContentScropt.actions.startTranscription,
        payload: {
          userid: appConfig.Service.userId
        }
      },
      "*"
    );
  });
  injectLocalScript("injected.js", () => {
  });
}).catch((error) => {
  console.error("Meeting routine execution failed:", error);
  isTranscriptDomErrorCaptured = true;
});
function injectLocalScript(fileName, callback = () => {
}) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(fileName);
  script.type = "text/javascript";
  script.onload = function() {
    if (callback) callback();
  };
  (document.head || document.documentElement).appendChild(script);
}
function createMutationHandler(ctx) {
  return function(mutations, observer) {
    handleTranscriptMutations(mutations, ctx);
  };
}
function handleTranscriptMutations(mutations, ctx) {
  var _a, _b, _c, _d;
  for (const _ of mutations) {
    try {
      const transcriptContainer = ctx.canUseAriaBasedTranscriptSelector ? selectElement(appConfig.Extension.transcriptSelectors.aria) : selectElement(appConfig.Extension.transcriptSelectors.fallback);
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
      ChatPanel.addLiveMessage({
        id: currentSpeakerId,
        speaker: currentSpeakerName,
        transcript: currentTranscript,
        timestamp: currentTimestamp
      });
      window.postMessage(
        {
          source: HubConnectionConfig.toContentScript.source,
          action: HubConnectionConfig.toContentScript.actions.realTimeTranscription,
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
      if (!isTranscriptDomErrorCaptured && !hasMeetingEnded) {
        console.log("Error in transcript mutation observer:", err);
      }
      isTranscriptDomErrorCaptured = true;
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
    const elements = selectElements(
      appConfig.Extension.meetingEndIcon.selector,
      appConfig.Extension.meetingEndIcon.text
    );
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
  var _a, _b, _c, _d;
  if (event.source !== window && event.data.source !== HubConnectionConfig.toContentScript.source) return;
  if (((_a = event.data) == null ? void 0 : _a.source) !== HubConnectionConfig.toContentScript.source) {
    return;
  }
  if (((_b = event.data) == null ? void 0 : _b.action) === HubConnectionConfig.toContentScript.actions.realTimeTranscription) {
    ChatPanel.addLiveMessage(event.data.payload);
  } else if (((_c = event.data) == null ? void 0 : _c.action) === HubConnectionConfig.toContentScript.actions.someoneIsJoining) {
    ChatPanel.addOthers(event.data.payload);
  } else if (((_d = event.data) == null ? void 0 : _d.action) === HubConnectionConfig.toContentScript.actions.startTranscription) {
    console.log("Start transcription view");
  }
});
