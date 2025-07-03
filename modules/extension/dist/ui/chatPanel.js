import { DateTime } from "../core/utils/datetime";
const DEFAULT_AVATAR_URL = "assets/icons/default-avatar.jpg";
export class ChatPanel {
    unauthorizedContainerEl;
    noActiveMeetingEl;
    activeMeetingButNotStartedEl;
    activeMeetingEl;
    transcriptionsContainerEl;
    direction = "ltr";
    constructor() {
        this.unauthorizedContainerEl = document.getElementById("au5-userUnAuthorized");
        this.noActiveMeetingEl = document.getElementById("au5-noActiveMeeting");
        this.activeMeetingButNotStartedEl = document.getElementById("au5-activeMeetingButNotStarted");
        this.activeMeetingEl = document.getElementById("au5-activeMeeting");
        this.transcriptionsContainerEl = this.activeMeetingEl?.querySelector(".au5-transcriptions-container");
    }
    setDirection(direction) {
        this.direction = direction;
    }
    showUserUnAuthorizedContainer() {
        this.hideAllContainers();
        if (this.unauthorizedContainerEl)
            this.unauthorizedContainerEl.classList.remove("hidden");
    }
    showNoActiveMeetingContainer(url) {
        this.hideAllContainers();
        if (this.noActiveMeetingEl)
            this.noActiveMeetingEl.classList.remove("hidden");
        this.setUrl(url);
    }
    showJoinMeetingContainer(url) {
        this.hideAllContainers();
        if (this.activeMeetingButNotStartedEl)
            this.activeMeetingButNotStartedEl.classList.remove("hidden");
        this.setUrl(url);
    }
    showTranscriptionContainer() {
        if (this.noActiveMeetingEl)
            this.noActiveMeetingEl.classList.add("hidden");
        if (this.activeMeetingButNotStartedEl)
            this.activeMeetingButNotStartedEl.classList.add("hidden");
        if (this.activeMeetingEl)
            this.activeMeetingEl.classList.remove("hidden");
        const editor = document.querySelector(".au5-chat-editor");
        if (editor) {
            editor.addEventListener("input", () => {
                if (editor.innerHTML.trim() === "<br>" || editor.innerHTML.trim() === "") {
                    editor.innerHTML = "";
                }
            });
        }
    }
    addEntry(entry) {
        if (!this.transcriptionsContainerEl) {
            return;
        }
        const existing = this.transcriptionsContainerEl.querySelector(`[data-id="${entry.blockId}"]`);
        if (existing) {
            const textEl = existing.querySelector(".au5-message-text");
            if (textEl)
                textEl.innerText = entry.content;
            return;
        }
        const entryBlock = document.createElement("div");
        entryBlock.setAttribute("data-id", entry.blockId);
        entryBlock.className = "au5-transcription";
        entryBlock.innerHTML = `
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
        ${entry.content}
      </div>

      <div class="au5-message-reactions">
        <div class="au5-reaction-list">
          <div class="au5-reaction au5-reaction-highlight" reaction-type="task" data-blockId="${entry.blockId}">
            <span class="au5-reaction-emoji">⚡</span>
            <div class="au5-reaction-users"></div>
          </div>

          <div class="au5-reaction au5-reaction-mute" reaction-type="important" data-blockId="${entry.blockId}">
            <span class="au5-reaction-emoji">🎯</span>
            <div class="au5-reaction-users"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
        this.transcriptionsContainerEl.appendChild(entryBlock);
        this.scrollToBottom();
    }
    botJoined(botName) {
        this.addUserJoinedOrLeaved(botName, true);
        if (!this.transcriptionsContainerEl) {
            return;
        }
        const botContainer = this.transcriptionsContainerEl.querySelector("#au5-addBot-container");
        if (botContainer) {
            botContainer.remove();
        }
        const botPlayContainer = this.activeMeetingEl?.querySelector("#au5-bot-playContainer");
        if (!botPlayContainer) {
            return;
        }
        botPlayContainer.classList.remove("hidden");
        const botNameEl = botPlayContainer.querySelector("#au5-bot-name");
        if (botNameEl) {
            botNameEl.innerText = botName;
        }
    }
    usersJoined(fullName) {
        this.addUserJoinedOrLeaved(fullName, true);
    }
    usersLeaved(fullName) {
        this.addUserJoinedOrLeaved(fullName, false);
    }
    addReaction(reaction) {
        if (!this.transcriptionsContainerEl) {
            return;
        }
        const transcriptionBlock = this.transcriptionsContainerEl.querySelector(`[data-id="${reaction.blockId}"]`);
        if (!transcriptionBlock) {
            console.warn("Transcription block not found for reaction:", reaction);
            return;
        }
        const reactionsContainer = transcriptionBlock.querySelector(".au5-reaction-list");
        if (!reactionsContainer) {
            console.warn("Reactions container not found in transcription block.");
            return;
        }
        const existingReaction = reactionsContainer.querySelector(`.au5-reaction[reaction-type="${reaction.reactionType}"]`);
        if (existingReaction) {
            const reactionUsersContainer = existingReaction.querySelector(".au5-reaction-users");
            if (!reactionUsersContainer) {
                console.warn("Reaction users container not found.");
                return;
            }
            const existingUser = reactionUsersContainer.querySelector(`[data-user-id="${reaction.user.id || ""}"]`);
            if (existingUser) {
                reactionUsersContainer.removeChild(existingUser);
                return;
            }
            const userSpan = document.createElement("img");
            userSpan.setAttribute("data-user-id", reaction.user.id || "");
            userSpan.className = "au5-reaction-user-avatar";
            userSpan.src = `${reaction.user.pictureUrl}`;
            userSpan.alt = `${reaction.user.fullName}'s avatar`;
            userSpan.title = reaction.user.fullName;
            reactionUsersContainer.appendChild(userSpan);
        }
    }
    botRequested(request) {
        if (!this.transcriptionsContainerEl) {
            return;
        }
        const botContainer = this.transcriptionsContainerEl.querySelector("#au5-addBot-container");
        if (botContainer) {
            botContainer.classList.add("hidden");
            const botRequested = document.createElement("div");
            botRequested.className = "au5-join-time";
            botRequested.innerText = `🤖 ${request.botName} bot requested by ${request.user.fullName}`;
            this.transcriptionsContainerEl.appendChild(botRequested);
        }
    }
    isOnline() {
        const text = this.activeMeetingEl?.querySelector("#connection-status-text");
        const status = this.activeMeetingEl?.querySelector("#connection-status");
        if (text) {
            text.innerText = "Online";
        }
        if (status) {
            status.classList.remove("offline");
            status.classList.add("online");
        }
    }
    showReconnecting() {
        const text = this.activeMeetingEl?.querySelector("#connection-status-text");
        if (text) {
            text.innerText = "Reconnecting...";
        }
    }
    isOffline() {
        const text = this.activeMeetingEl?.querySelector("#connection-status-text");
        const status = this.activeMeetingEl?.querySelector("#connection-status");
        if (text) {
            text.innerText = "Online";
        }
        if (status) {
            status.classList.remove("offline");
            status.classList.add("online");
        }
    }
    pauseAndPlay(action) {
        if (!this.activeMeetingEl) {
            return;
        }
        const botPlayAction = this.activeMeetingEl.querySelector("#au5-bot-playAction");
        const botPauseAction = this.activeMeetingEl.querySelector("#au5-bot-puaseAction");
        if (!botPlayAction || !botPauseAction) {
            return;
        }
        if (action.isPaused === true) {
            botPlayAction.removeAttribute("style");
            botPauseAction.setAttribute("style", `display:none;`);
            this.addGeneralMessage("⏸️ Transcription paused by " + action.user.fullName);
        }
        else {
            botPlayAction.setAttribute("style", `display:none;`);
            botPauseAction.removeAttribute("style");
            this.addGeneralMessage("▶️ Transcription resumed by " + action.user.fullName);
        }
    }
    setUrl(url) {
        const urlElement = document.getElementsByClassName("au5-url");
        Array.from(urlElement).forEach((el) => {
            if (el) {
                let displayUrl = url;
                if (url.length > 36) {
                    displayUrl = url.slice(0, 36) + "(*)";
                }
                el.innerHTML = displayUrl;
            }
        });
    }
    addUserJoinedOrLeaved(name, isJoined) {
        if (!this.transcriptionsContainerEl) {
            return;
        }
        const usersJoined = document.createElement("div");
        usersJoined.className = "au5-join-time";
        usersJoined.innerText = `👋 ${name} ${isJoined ? "Joined" : "Leaved"} at ${DateTime.toHoursAndMinutes(new Date())}`;
        this.transcriptionsContainerEl.appendChild(usersJoined);
        this.scrollToBottom();
    }
    addGeneralMessage(content) {
        if (!this.transcriptionsContainerEl) {
            return;
        }
        const usersJoined = document.createElement("div");
        usersJoined.className = "au5-join-time";
        usersJoined.innerText = `${content} at ${DateTime.toHoursAndMinutes(new Date())}`;
        this.transcriptionsContainerEl.appendChild(usersJoined);
        this.scrollToBottom();
    }
    scrollToBottom() {
        if (this.transcriptionsContainerEl) {
            this.transcriptionsContainerEl.scrollTo({
                top: this.transcriptionsContainerEl.scrollHeight,
                behavior: "smooth"
            });
        }
    }
    hideAllContainers() {
        if (this.unauthorizedContainerEl)
            this.unauthorizedContainerEl.classList.add("hidden");
        if (this.noActiveMeetingEl)
            this.noActiveMeetingEl.classList.add("hidden");
        if (this.activeMeetingButNotStartedEl)
            this.activeMeetingButNotStartedEl.classList.add("hidden");
    }
}
