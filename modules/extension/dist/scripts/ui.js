var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var DateTime;
((DateTime2) => {
  function toHoursAndMinutes(input) {
    const date = typeof input === "string" ? new Date(input) : input;
    const hh = date.getUTCHours().toString().padStart(2, "0");
    const mm = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }
  DateTime2.toHoursAndMinutes = toHoursAndMinutes;
})(DateTime || (DateTime = {}));
class ChatPanel {
  constructor(companyNameText, roomTitleText, direction = "ltr") {
    __publicField(this, "noActiveMeetingEl");
    __publicField(this, "activeMeetingButNotStartedEl");
    __publicField(this, "activeMeetingEl");
    __publicField(this, "footerEl");
    __publicField(this, "transcriptionsContainerEl");
    var _a;
    this.direction = direction;
    this.addHeader(companyNameText, roomTitleText);
    this.noActiveMeetingEl = document.getElementById("au5-noActiveMeeting");
    this.activeMeetingButNotStartedEl = document.getElementById("au5-activeMeetingButNotStarted");
    this.activeMeetingEl = document.getElementById("au5-activeMeeting");
    this.footerEl = document.getElementById("au5-transcription-footer");
    this.transcriptionsContainerEl = (_a = this.activeMeetingEl) == null ? void 0 : _a.querySelector(
      ".au5-transcriptions-container"
    );
  }
  showJoinMeetingContainer() {
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.remove("au5-hidden");
  }
  showNoActiveMeetingContainer() {
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.remove("au5-hidden");
  }
  showTranscriptionContainer() {
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.add("au5-hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.add("au5-hidden");
    if (this.activeMeetingEl) this.activeMeetingEl.classList.remove("au5-hidden");
    if (this.footerEl) this.footerEl.classList.remove("au5-hidden");
    const editor = document.querySelector(".au5-chat-editor");
    if (editor) {
      editor.addEventListener("input", () => {
        if (editor.innerHTML.trim() === "<br>" || editor.innerHTML.trim() === "") {
          editor.innerHTML = "";
        }
      });
    }
  }
  addTranscription(entry) {
    if (!this.transcriptionsContainerEl) {
      console.error("Transcriptions container element not found.");
      return;
    }
    const existing = this.transcriptionsContainerEl.querySelector(
      `[data-id="${entry.transcriptBlockId}"]`
    );
    if (existing) {
      const textEl = existing.querySelector(".au5-message-text");
      if (textEl) textEl.innerText = entry.transcript;
      return;
    }
    const transcriptBlock = document.createElement("div");
    transcriptBlock.setAttribute("data-id", entry.transcriptBlockId);
    transcriptBlock.className = "au5-transcription";
    transcriptBlock.innerHTML = `
  <div class="au5-transcription-message">
    <div class="au5-message-avatar">
      <img
        class="au5-avatar-image"
        src="${entry.speaker.pictureUrl || "https://i.sstatic.net/34AD2.jpg"}"
        alt="Sender Avatar"
      />
    </div>

    <div class="au5-message-bubble">
      <div class="au5-message-header">
        <span class="au5-message-sender">${entry.speaker.fullName}</span>
        <span class="au5-message-time">${DateTime.toHoursAndMinutes(entry.timestamp)}</span>
      </div>

      <div class="au5-message-text" style="direction: ${this.direction};">
        ${entry.transcript}
      </div>

      <div class="au5-message-reactions">
        <div class="au5-reaction-list">
          <div class="au5-reaction au5-reaction-highlight" reaction-type="task" data-blockId="${entry.transcriptBlockId}">
            <span class="au5-reaction-emoji">⚡</span>
            <div class="au5-reaction-users"></div>
          </div>

          <div class="au5-reaction au5-reaction-mute" reaction-type="important" data-blockId="${entry.transcriptBlockId}">
            <span class="au5-reaction-emoji">🎯</span>
            <div class="au5-reaction-users"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
    this.transcriptionsContainerEl.appendChild(transcriptBlock);
    if (this.activeMeetingEl) {
      this.activeMeetingEl.scrollTo({
        top: this.activeMeetingEl.scrollHeight,
        behavior: "smooth"
      });
    }
  }
  addHeader(companyNameText, roomTitleText) {
    const headerElement = document.querySelector(".au5-header");
    if (!headerElement) return;
    const headerLeft = document.createElement("div");
    headerLeft.className = "au5-header-left";
    const companyAvatar = document.createElement("div");
    companyAvatar.className = "au5-header-avatar";
    companyAvatar.textContent = "A";
    const infoContainer = document.createElement("div");
    infoContainer.className = "au5-header-info";
    const companyName = document.createElement("div");
    companyName.className = "au5-header-title";
    companyName.textContent = companyNameText;
    const roomTitle = document.createElement("div");
    roomTitle.className = "au5-header-subtitle";
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
    for (const [platform, pattern] of Object.entries(patterns)) {
      if (pattern.test(this._url)) {
        platformName = platform;
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
let chatPanel = null;
async function initializeChatPanel() {
  const url = await getCurrentUrl();
  new MeetingPlatformFactory(url).getPlatform();
  chatPanel = new ChatPanel("Asa Co", "No Active Meeting", "ltr");
  chatPanel.showTranscriptionContainer();
  chatPanel.addTranscription({
    transcriptBlockId: crypto.randomUUID(),
    transcript: "Welcome to the meeting!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: "12345",
    transcript: "Welcome to the meeting!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: "12345",
    transcript: "Welcome to the meeting!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: crypto.randomUUID(),
    transcript: "Welcome to the meeting!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: crypto.randomUUID(),
    transcript: "Welcome to the meetingh!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: crypto.randomUUID(),
    transcript: "Welcome to the meetingh!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: crypto.randomUUID(),
    transcript: "Welcome to the meetingh!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: crypto.randomUUID(),
    transcript: "Welcome to the meetingh!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: crypto.randomUUID(),
    transcript: "Welcome to the meetingh!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  chatPanel.addTranscription({
    transcriptBlockId: crypto.randomUUID(),
    transcript: "Welcome to the meetingh!",
    timestamp: /* @__PURE__ */ new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
}
initializeChatPanel();
