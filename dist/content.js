var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { d as detectBrowser, c as createMeetingPlatformInstance, C as ConfigurationManager } from "./meetingPlatform.js";
class DomUtils {
  constructor(browserInjector) {
    this.browserInjector = browserInjector;
  }
  /**
   * Waits for an element matching the selector and optional exact text.
   * Uses `requestAnimationFrame` for efficient polling.
   *
   * @param selector - CSS selector string
   * @param text - Optional exact text content to match
   * @returns Promise resolving with the matching HTMLElement
   */
  async waitForMatch(selector, text) {
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
  /**
   * Selects a single HTMLElement matching the selector.
   *
   * @param selector - CSS selector string
   * @returns The matching HTMLElement or null
   */
  selectSingle(selector) {
    return document.querySelector(selector);
  }
  /**
   * Selects all HTMLElements matching the selector and optional regex text.
   *
   * @param selector - CSS selector string
   * @param textPattern - Optional regex pattern to match text content
   * @returns Array of matching HTMLElements
   */
  selectAll(selector, textPattern) {
    const elements = Array.from(document.querySelectorAll(selector));
    if (!textPattern) return elements;
    const regex = new RegExp(textPattern);
    return elements.filter((el) => regex.test(el.textContent ?? ""));
  }
  /**
   * Applies an opacity style to a target container or its second child.
   *
   * @param container - The parent HTMLElement
   * @param applyToSelf - If true, applies style to container; otherwise, to second child
   * @param opacity - Opacity value (e.g., "0.5")
   */
  setOpacity(container, applyToSelf, opacity) {
    if (applyToSelf) {
      container.style.opacity = opacity;
    } else {
      const target = container.children[1];
      target == null ? void 0 : target.style.setProperty("opacity", opacity);
    }
  }
  /**
   * Attempts to locate a DOM container using aria selector, falling back to a secondary selector.
   *
   * @param ariaSelector - ARIA-based CSS selector
   * @param fallbackSelector - Fallback CSS selector
   * @returns Object with container and flag indicating if ARIA selector was used
   */
  getDomContainer(ariaSelector, fallbackSelector) {
    const container = document.querySelector(ariaSelector);
    if (container) return { container, usedAria: true };
    return {
      container: document.querySelector(fallbackSelector),
      usedAria: false
    };
  }
  injectScript(fileName, onLoad = () => {
  }) {
    this.browserInjector.inject(fileName, onLoad);
  }
}
const css = ".au5-panel {\r\n  background-color: #fff;\r\n  border-radius: 16px;\r\n  bottom: 80px;\r\n  box-sizing: border-box;\r\n  max-width: 100%;\r\n  position: absolute;\r\n  right: 16px;\r\n  top: 16px;\r\n  transform: none;\r\n  z-index: 9999;\r\n  width: 360px;\r\n  font-family: system-ui;\r\n}\r\n\r\n.au5-header {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  padding: 16px;\r\n}\r\n\r\n.au5-header-left {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.au5-avatar {\r\n  width: 40px;\r\n  height: 40px;\r\n  border-radius: 50%;\r\n  object-fit: cover;\r\n}\r\n\r\n.au5-avatar img {\r\n  border-radius: 50%;\r\n  width: 36px;\r\n  height: 36px;\r\n}\r\n\r\n.au5-room-name {\r\n  font-weight: bold;\r\n  font-size: 14px;\r\n}\r\n\r\n.au5-member-count {\r\n  font-size: 12px;\r\n  color: #888;\r\n}\r\n\r\n.au5-header-icons {\r\n  display: flex;\r\n  gap: 8px;\r\n}\r\n\r\n.au5-header-icons .au5-icon {\r\n  font-size: 16px;\r\n  display: flex;\r\n  cursor: pointer;\r\n  border-radius: 4px;\r\n  width: 28px;\r\n  background-color: #f4f4f4f4;\r\n  height: 28px;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\n\r\n.au5-container {\r\n  height: calc(100vh - 255px);\r\n  overflow-y: auto;\r\n  padding: 16px;\r\n}\r\n\r\n.au5-message {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 4px;\r\n  margin-bottom: 12px;\r\n  position: relative;\r\n}\r\n\r\n.au5-bubble {\r\n  background: #f8f8f8;\r\n  border-radius: 12px;\r\n  padding: 8px 12px;\r\n  flex: 1;\r\n}\r\n\r\n.au5-sender {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  margin-bottom: 8px;\r\n}\r\n\r\n.au5-sender-title {\r\n  font-weight: bold;\r\n  font-size: 13px;\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.au5-text {\r\n  font-size: 13px;\r\n  margin-bottom: 16px;\r\n  direction: rtl;\r\n}\r\n\r\n.au5-sender-time {\r\n  font-size: 11px;\r\n  color: #888;\r\n  text-align: right;\r\n}\r\n\r\n.au5-message-reactions {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  margin-top: 8px;\r\n}\r\n\r\n.au5-reactions {\r\n  display: flex;\r\n  gap: 4px;\r\n  left: 48px;\r\n  bottom: 8px;\r\n}\r\n\r\n.au5-reactions .reaction {\r\n  display: flex;\r\n  gap: 4px;\r\n  padding: 1px;\r\n  border-radius: 100px;\r\n  cursor: pointer;\r\n  border: 1px solid #e5e5e5;\r\n  transition: background-color 0.2s;\r\n  background-color: #e4e4e4;\r\n  align-items: center;\r\n  align-content: center;\r\n  min-width: 16px;\r\n  max-height: 16px;\r\n}\r\n\r\n.au5-reactions .reaction-emoji {\r\n  font-size: 12px;\r\n  width: 16px;\r\n  height: 16px;\r\n}\r\n\r\n.au5-reactions .reaction-users {\r\n  display: flex;\r\n  margin-left: 2px;\r\n}\r\n\r\n.au5-reactions .reaction-user {\r\n  width: 16px;\r\n  height: 16px;\r\n  border-radius: 50%;\r\n  border: 1px solid white;\r\n  margin-left: -4px;\r\n  display: flex;\r\n}\r\n\r\n.au5-reactions .reaction-user img {\r\n  width: 16px;\r\n  height: 16px;\r\n  border-radius: 50%;\r\n}\r\n\r\n.au5-btn {\r\n  background: #2196f3;\r\n  border: none;\r\n  color: white;\r\n  font-size: 13px;\r\n  padding: 8px 12px;\r\n  border-radius: 8px;\r\n  height: 38px;\r\n  margin-left: 8px;\r\n  cursor: pointer;\r\n  font-family: system-ui;\r\n  width: -webkit-fill-available;\r\n}\r\n\r\n.au5-send-btn {\r\n  height: auto;\r\n  width: auto;\r\n}\r\n\r\n.au5-join-time {\r\n  text-align: center;\r\n  font-size: 12px;\r\n  color: #666;\r\n  margin: 16px 0;\r\n}\r\n\r\n.au5-input-wrapper {\r\n  display: flex;\r\n  border-radius: 12px;\r\n  width: -webkit-fill-available;\r\n}\r\n\r\n.au5-input-container {\r\n  display: flex;\r\n  align-items: center;\r\n  flex: 1;\r\n  border: 1px solid #c2bdbd;\r\n  padding: 4px;\r\n  border-radius: 8px;\r\n  width: -webkit-fill-available;\r\n}\r\n\r\n.au5-input {\r\n  flex: 1;\r\n  border: none;\r\n  font-size: 14px;\r\n  padding: 8px;\r\n  border-radius: 8px;\r\n  outline: none;\r\n  font-family: system-ui;\r\n}\r\n\r\n.au5-hidden {\r\n  display: none;\r\n}\r\n\r\n.au5-footer {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  padding: 0 16px 16px 16px;\r\n}\r\n";
class SidePanel {
  static createSidePanel(roomName, meetingId, direction = "ltr") {
    this.direction = direction;
    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
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
                  <input type="text" class="au5-input" placeholder="Write your message ..." />
                  <button class="au5-send-btn au5-btn">Send</button>
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
let config;
const browser = detectBrowser();
const domUtils = new DomUtils(browser);
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
async function waitForStartingMeet() {
  try {
    const configurationManager = new ConfigurationManager(browser);
    config = await configurationManager.getConfig();
    await domUtils.waitForMatch(config.extension.meetingEndIcon.selector, config.extension.meetingEndIcon.text);
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
waitForStartingMeet().then(async () => {
  var _a;
  const platform = createMeetingPlatformInstance(window.location.href);
  if (!platform) {
    console.error("Unsupported meeting platform");
    return;
  }
  const meetingId = platform.getMeetingTitle();
  SidePanel.createSidePanel("Asax Co", meetingId, config.service.direction);
  domUtils.injectScript("injected.js");
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
