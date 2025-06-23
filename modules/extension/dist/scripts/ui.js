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
const DEFAULT_AVATAR_URL = "assets/icons/default-avatar.jpg";
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
    this.hideAllContainers();
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.remove("hidden");
    this.setUrl(url);
  }
  showJoinMeetingContainer(url) {
    this.hideAllContainers();
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.remove("hidden");
    this.setUrl(url);
  }
  showTranscriptionContainer() {
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
        src="${entry.speaker.pictureUrl || DEFAULT_AVATAR_URL}"
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
          displayUrl = url.slice(0, 36) + "(*)";
        }
        el.innerHTML = displayUrl;
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
new ChatPanel();
document.addEventListener("DOMContentLoaded", async () => {
});
