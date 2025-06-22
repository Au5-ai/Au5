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
  constructor() {
    __publicField(this, "unauthorizedContainerEl");
    __publicField(this, "noActiveMeetingEl");
    __publicField(this, "activeMeetingButNotStartedEl");
    __publicField(this, "activeMeetingEl");
    __publicField(this, "transcriptionsContainerEl");
    __publicField(this, "direction", "ltr");
    var _a;
    this.unauthorizedContainerEl = document.getElementById("au5-userUnAuthorized");
    this.noActiveMeetingEl = document.getElementById("au5-noActiveMeeting");
    this.activeMeetingButNotStartedEl = document.getElementById("au5-activeMeetingButNotStarted");
    this.activeMeetingEl = document.getElementById("au5-activeMeeting");
    this.transcriptionsContainerEl = (_a = this.activeMeetingEl) == null ? void 0 : _a.querySelector(
      ".au5-transcriptions-container"
    );
  }
  setDirection(direction) {
    this.direction = direction;
  }
  showUserUnAuthorizedContainer() {
    this.hideAllContainers();
    if (this.unauthorizedContainerEl) this.unauthorizedContainerEl.classList.remove("hidden");
  }
  showNoActiveMeetingContainer(url) {
    console.log("No active meeting for URL:", url);
    this.hideAllContainers();
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.remove("hidden");
    this.setUrl(url);
  }
  showJoinMeetingContainer(url) {
    this.hideAllContainers();
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.remove("hidden");
    this.setUrl(url);
  }
  showTranscriptionContainer(companyNameText, roomTitleText) {
    const headerElement = document.querySelector(".au5-header");
    if (!headerElement) return;
    headerElement.classList.remove("hidden");
    this.addHeader(companyNameText, roomTitleText);
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.add("hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.add("hidden");
    if (this.activeMeetingEl) this.activeMeetingEl.classList.remove("hidden");
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
        src="${entry.speaker.pictureUrl || "assets/icons/default-avatar.jpg"}"
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
    this.scrollToBottom();
  }
  usersJoined(data) {
    this.addUserJoinedOrLeaved(data.user, true);
  }
  usersLeaved(data) {
    this.addUserJoinedOrLeaved(data.user, false);
  }
  addReaction(reaction) {
    if (!this.transcriptionsContainerEl) {
      return;
    }
    const transcriptionBlock = this.transcriptionsContainerEl.querySelector(
      `[data-id="${reaction.transcriptBlockId}"]`
    );
    if (!transcriptionBlock) {
      console.warn("Transcription block not found for reaction:", reaction);
      return;
    }
    const reactionsContainer = transcriptionBlock.querySelector(".au5-reaction-list");
    if (!reactionsContainer) {
      console.warn("Reactions container not found in transcription block.");
      return;
    }
    const existingReaction = reactionsContainer.querySelector(
      `.au5-reaction[reaction-type="${reaction.reactionType}"]`
    );
    if (existingReaction) {
      const reactionUsersContainer = existingReaction.querySelector(".au5-reaction-users");
      if (!reactionUsersContainer) {
        console.warn("Reaction users container not found.");
        return;
      }
      const existingUser = reactionUsersContainer.querySelector(
        `[data-user-name="${reaction.user.fullName || ""}"]`
      );
      if (existingUser) {
        reactionUsersContainer.removeChild(existingUser);
        return;
      }
      const userSpan = document.createElement("img");
      userSpan.setAttribute("data-user-name", reaction.user.fullName || "");
      userSpan.className = "au5-reaction-user-avatar";
      userSpan.src = `${reaction.user.pictureUrl}`;
      userSpan.alt = `${reaction.user.fullName}'s avatar`;
      userSpan.title = reaction.user.fullName;
      reactionUsersContainer.appendChild(userSpan);
    }
  }
  setUrl(url) {
    const urlElement = document.getElementsByClassName("au5-url");
    Array.from(urlElement).forEach((el) => {
      if (el) {
        let displayUrl = url;
        if (url.length > 35) {
          displayUrl = url.slice(0, 35) + " (...)";
        }
        el.innerHTML = displayUrl;
        console.log("No active meeting for URL:", displayUrl);
      }
    });
  }
  addUserJoinedOrLeaved(user, isJoined) {
    if (!this.transcriptionsContainerEl) {
      return;
    }
    const usersJoined = document.createElement("div");
    usersJoined.className = "au5-join-time";
    usersJoined.innerText = `👋 ${user.fullName} ${isJoined ? "Joined" : "Leaved"} at ${DateTime.toHoursAndMinutes(
      /* @__PURE__ */ new Date()
    )}`;
    this.transcriptionsContainerEl.appendChild(usersJoined);
    this.scrollToBottom();
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
  scrollToBottom() {
    if (this.activeMeetingEl) {
      this.activeMeetingEl.scrollTo({
        top: this.activeMeetingEl.scrollHeight,
        behavior: "smooth"
      });
    }
  }
  hideAllContainers() {
    if (this.unauthorizedContainerEl) this.unauthorizedContainerEl.classList.add("hidden");
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.add("hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.add("hidden");
  }
}
const platformRegex = {
  googleMeet: /https:\/\/meet\.google\.com\/([a-zA-Z0-9]{3}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{3})/
};
class GoogleMeet {
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
      "Google Meet": platformRegex.googleMeet
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
const chatPanel = new ChatPanel();
let platform = null;
async function getCurrentUrl() {
  if (typeof chrome !== "undefined" && chrome.tabs) {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        var _a;
        resolve(((_a = tabs[0]) == null ? void 0 : _a.url) || window.location.href);
      });
    });
  }
  return window.location.href;
}
function setupButtonHandlers() {
  const joinButton = document.getElementById("au5-btn-joinMeeting");
  const reloadButton = document.getElementById("au5-btn-reload");
  const optionsButton = document.getElementById("au5-btn-options");
  const themeToggle = document.getElementById("au5-theme-toggle");
  const github = document.getElementById("github-link");
  const discord = document.getElementById("discord-link");
  joinButton == null ? void 0 : joinButton.addEventListener("click", handleJoinMeetingClick);
  reloadButton == null ? void 0 : reloadButton.addEventListener("click", handleReloadMeetingClick);
  document.addEventListener("click", (event) => {
    const target = event.target;
    const reaction = target.closest(".au5-reaction");
    if (reaction) {
      reaction.getAttribute("reaction-type");
      reaction.getAttribute("data-blockId");
    }
  });
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const html = document.documentElement;
      const currentTheme = html.getAttribute("data-gpts-theme");
      html.setAttribute("data-gpts-theme", currentTheme === "light" ? "dark" : "light");
      const darkSvg = document.getElementById("darkmode");
      const lightSvg = document.getElementById("lightmode");
      if (currentTheme === "light") {
        darkSvg == null ? void 0 : darkSvg.setAttribute("style", "display: inline;");
        lightSvg == null ? void 0 : lightSvg.setAttribute("style", "display: none;");
      } else {
        darkSvg == null ? void 0 : darkSvg.setAttribute("style", "display: none;");
        lightSvg == null ? void 0 : lightSvg.setAttribute("style", "display: inline;");
      }
    });
  }
  optionsButton == null ? void 0 : optionsButton.addEventListener("click", () => {
    window.open("options.html", "_blank");
  });
  github == null ? void 0 : github.addEventListener("click", () => {
    window.open("https://github.com/Au5-ai/Au5", "_blank");
  });
  discord == null ? void 0 : discord.addEventListener("click", () => {
    window.open("https://discord.com/channels/1385091638422016101", "_blank");
  });
}
async function handleJoinMeetingClick() {
  return;
}
async function handleReloadMeetingClick() {
  const url = await getCurrentUrl();
  platform = new MeetingPlatformFactory(url).getPlatform();
  if (!platform) {
    chatPanel.showNoActiveMeetingContainer(url);
  } else {
    chatPanel.showJoinMeetingContainer(url);
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  setupButtonHandlers();
});
