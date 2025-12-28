import StateManager from "../core/stateManager";
import {
  Entry,
  PageState,
  Participant,
  PauseAndPlayTranscriptionMessage,
  Reaction,
  ReactionAppliedMessage,
  RequestToAddBotMessage
} from "../core/types";
import {DateTime} from "../core/utils/datetime";
const DEFAULT_AVATAR_URL = "assets/icons/default-avatar.jpg";
export class ChatPanel {
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  private unauthorizedContainerEl: HTMLElement | null;
  private loadingContainerEl: HTMLElement | null;
  private noActiveMeetingEl: HTMLElement | null;
  private activeMeetingButNotStartedEl: HTMLElement | null;
  private activeMeetingEl: HTMLElement | null;
  private transcriptionsContainerEl: HTMLDivElement | null;
  private direction: "ltr" | "rtl" = "ltr";
  private reactions: Array<Reaction> = [];
  private stateManager = StateManager.getInstance();

  constructor() {
    this.unauthorizedContainerEl = document.getElementById("au5-userUnAuthorized");
    this.loadingContainerEl = document.getElementById("au5-loading");
    this.noActiveMeetingEl = document.getElementById("au5-noActiveMeeting");
    this.activeMeetingButNotStartedEl = document.getElementById("au5-activeMeetingButNotStarted");
    this.activeMeetingEl = document.getElementById("au5-activeMeeting");

    this.transcriptionsContainerEl = this.activeMeetingEl?.querySelector(
      ".au5-transcriptions-container"
    ) as HTMLDivElement;
  }
  public setUserLogin(user: Participant): void {
    const avatar = document.getElementById("userAvatar");
    if (avatar) {
      avatar.setAttribute("src", user.pictureUrl || DEFAULT_AVATAR_URL);
    }
  }

  public setDirection(direction: "ltr" | "rtl"): void {
    this.direction = direction;
  }

  public setReactions(reactions: Array<Reaction>): void {
    this.reactions = reactions;
  }

  public showLoading(): void {
    this.hideAllContainers();
    if (this.loadingContainerEl) {
      this.loadingContainerEl.classList.remove("hidden");
    }
  }

  public showUserUnAuthorizedContainer(): void {
    this.hideAllContainers();
    if (this.unauthorizedContainerEl) {
      this.unauthorizedContainerEl.classList.remove("hidden");
      this.stateManager.setPage(PageState.UserUnAuthorized);
    }
  }

  public showNoActiveMeetingContainer(url: string): void {
    this.hideAllContainers();
    if (this.noActiveMeetingEl) {
      this.noActiveMeetingEl.classList.remove("hidden");
      this.stateManager.setPage(PageState.NoActiveMeeting);
    }
    this.setUrl(url);
  }

  public showJoinMeetingContainer(url: string): void {
    this.hideAllContainers();
    if (this.activeMeetingButNotStartedEl) {
      this.activeMeetingButNotStartedEl.classList.remove("hidden");
      this.stateManager.setPage(PageState.ActiveMeetingButNotStarted);
    }
    this.setUrl(url);
  }

  public showTranscriptionContainer(): void {
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
    this.stateManager.setPage(PageState.ActiveMeeting);
  }

  public addEntry(entry: Entry): void {
    if (!this.transcriptionsContainerEl) {
      return;
    }
    const existing = this.transcriptionsContainerEl.querySelector(`[data-id="${entry.blockId}"]`) as HTMLDivElement;
    if (existing) {
      const textEl = existing.querySelector(".au5-message-text") as HTMLDivElement;
      if (textEl) textEl.innerText = entry.content;
      return;
    }

    const isChat = entry.entryType === "Chat";
    const iconHtml = isChat
      ? '<span class="au5-message-type-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-more-icon lucide-message-circle-more"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path><path d="M8 12h.01"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path></svg></span>'
      : '<span class="au5-message-type-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-closed-caption-icon lucide-closed-caption"><path d="M10 9.17a3 3 0 1 0 0 5.66"/><path d="M17 9.17a3 3 0 1 0 0 5.66"/><rect x="2" y="5" width="20" height="14" rx="2"/></svg></span>';

    const entryBlock = document.createElement("div");
    entryBlock.setAttribute("data-id", entry.blockId);
    entryBlock.className = "au5-transcription";
    entryBlock.innerHTML = `
  <div class="au5-transcription-message">
    <div class="au5-message-avatar">
      <img
        class="au5-avatar-image"
        src="${entry.participant.pictureUrl || DEFAULT_AVATAR_URL}"
        alt="Sender Avatar"
      />
    </div>

    <div class="au5-message-bubble">
      <div class="au5-message-header">
      <span class="au5-message-sender">${this.escapeHtml(entry.participant.fullName)}</span>
      <span class="au5-message-time">${DateTime.toHoursAndMinutes(entry.timestamp)}
      ${iconHtml}
        </span>
      </div>

      <div class="au5-message-text" style="direction: ${this.direction};">
        ${this.escapeHtml(entry.content)}
      </div>

      ${this.getReactionsHtml(entry.blockId)} 
    </div>
  </div>`;

    this.transcriptionsContainerEl.appendChild(entryBlock);
    this.scrollToBottom();
  }

  public botJoined(botName: string): void {
    this.addUserJoinedOrLeaved(botName, true);
    this.stateManager.setBotAdded(true);

    this.removeBotContainer();
    const botPlayContainer = this.activeMeetingEl?.querySelector("#au5-bot-playContainer") as HTMLDivElement;
    if (!botPlayContainer) {
      return;
    }
    botPlayContainer.classList.remove("hidden");
    const botNameEl = botPlayContainer.querySelector("#au5-bot-name") as HTMLDivElement;
    if (botNameEl) {
      botNameEl.innerText = botName;
    }
  }

  public removeBotContainer(): void {
    const botContainer = document.querySelector("#au5-addBot-container") as HTMLDivElement;
    if (botContainer) {
      botContainer.remove();
      this.stateManager.disableBotContainer();
    }
  }

  public usersJoined(fullName: string): void {
    this.addUserJoinedOrLeaved(fullName, true);
  }

  public usersLeaved(fullName: string): void {
    this.addUserJoinedOrLeaved(fullName, false);
  }

  public addReaction(reaction: ReactionAppliedMessage): void {
    if (!this.transcriptionsContainerEl) {
      return;
    }

    const transcriptionBlock = this.transcriptionsContainerEl.querySelector(
      `[data-id="${reaction.blockId}"]`
    ) as HTMLDivElement;

    if (!transcriptionBlock) {
      console.warn("Transcription block not found for reaction:", reaction);
      return;
    }

    const reactionsContainer = transcriptionBlock.querySelector(".au5-reaction-list") as HTMLDivElement;
    if (!reactionsContainer) {
      console.warn("Reactions container not found in transcription block.");
      return;
    }

    const existingReaction = reactionsContainer.querySelector(
      `.au5-reaction[reaction-type="${reaction.reactionType}"]`
    ) as HTMLDivElement;

    if (existingReaction) {
      const reactionUsersContainer = existingReaction.querySelector(".au5-reaction-users") as HTMLDivElement;
      if (!reactionUsersContainer) {
        console.warn("Reaction users container not found.");
        return;
      }

      const existingUser = reactionUsersContainer.querySelector(
        `[data-user-id="${reaction.user.id || ""}"]`
      ) as HTMLImageElement;

      if (existingUser) {
        reactionUsersContainer.removeChild(existingUser);
        return;
      }

      const userSpan = document.createElement("img");
      userSpan.setAttribute("data-user-id", reaction.user.id || "");
      userSpan.className = "au5-reaction-user-avatar";
      userSpan.src = `${reaction.user.pictureUrl || DEFAULT_AVATAR_URL}`;
      userSpan.alt = `${reaction.user.fullName}'s avatar`;
      userSpan.title = reaction.user.fullName;
      reactionUsersContainer.appendChild(userSpan);
    }
  }

  public botRequested(request: RequestToAddBotMessage): void {
    if (!this.transcriptionsContainerEl) {
      return;
    }
    const botContainer = this.transcriptionsContainerEl.querySelector("#au5-addBot-container") as HTMLDivElement;

    if (botContainer) {
      botContainer.classList.add("hidden");
      const botRequested = document.createElement("div");
      botRequested.className = "au5-join-time";

      botRequested.innerText = `🤖 bot requested by ${request.user.fullName}`;
      this.transcriptionsContainerEl.appendChild(botRequested);
    }
  }

  public isOnline(): void {
    const text = document.getElementById("connection-status-text") as HTMLDivElement;
    const status = document.getElementById("connection-status") as HTMLDivElement;

    if (text) {
      text.innerText = "Online";
    }
    if (status) {
      status.classList.remove("offline");
      status.classList.add("online");
    }
    this.stateManager.setConnected(true);
  }

  public showReconnecting(): void {
    const text = document.querySelector("#connection-status-text") as HTMLDivElement;
    if (text) {
      text.innerText = "Reconnecting...";
    }
  }

  public isOffline(): void {
    const text = document.getElementById("connection-status-text") as HTMLDivElement;
    const status = document.getElementById("connection-status") as HTMLDivElement;

    if (text) {
      text.innerText = "Offline";
    }
    if (status) {
      status.classList.add("offline");
      status.classList.remove("online");
    }
    this.stateManager.setConnected(false);
  }

  public pauseAndPlay(action: PauseAndPlayTranscriptionMessage): void {
    if (!this.activeMeetingEl) {
      return;
    }

    const botPlayAction = this.activeMeetingEl.querySelector("#au5-bot-playAction") as HTMLDivElement;
    const botPauseAction = this.activeMeetingEl.querySelector("#au5-bot-pauseAction") as HTMLDivElement;
    if (!botPlayAction || !botPauseAction) {
      return;
    }

    this.stateManager.pauseTranscription(action.isPaused);
    if (action.isPaused === true) {
      botPlayAction.removeAttribute("style");
      botPauseAction.setAttribute("style", `display:none;`);
      this.addGeneralMessage("🫸🏻 Transcription paused by " + action.user.fullName);
    } else {
      botPlayAction.setAttribute("style", `display:none;`);
      botPauseAction.removeAttribute("style");
      this.addGeneralMessage("🎮 Transcription resumed by " + action.user.fullName);
    }
  }

  private setUrl(url: string): void {
    const urlElement = document.getElementsByClassName("au5-url");

    Array.from(urlElement).forEach((el: Element) => {
      if (el) {
        let displayUrl = url;
        if (url.length > 36) {
          displayUrl = url.slice(0, 36) + "(*)";
        }
        el.textContent = displayUrl;
      }
    });
  }

  private addUserJoinedOrLeaved(name: string, isJoined: boolean): void {
    if (!this.transcriptionsContainerEl) {
      return;
    }
    const usersJoined = document.createElement("div");
    usersJoined.className = "au5-join-time";
    usersJoined.innerText = `👋 ${name} ${isJoined ? "Joined" : "Leaved"} at ${DateTime.toHoursAndMinutes(new Date())}`;
    this.transcriptionsContainerEl.appendChild(usersJoined);
    this.scrollToBottom();
  }

  private addGeneralMessage(content: string): void {
    if (!this.transcriptionsContainerEl) {
      return;
    }
    const usersJoined = document.createElement("div");
    usersJoined.className = "au5-join-time";
    usersJoined.innerText = `${content}`;
    this.transcriptionsContainerEl.appendChild(usersJoined);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.transcriptionsContainerEl) {
      this.transcriptionsContainerEl.scrollTo({
        top: this.transcriptionsContainerEl.scrollHeight,
        behavior: "smooth"
      });
    }
  }

  private hideAllContainers(): void {
    if (this.loadingContainerEl) this.loadingContainerEl.classList.add("hidden");
    if (this.unauthorizedContainerEl) this.unauthorizedContainerEl.classList.add("hidden");
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.add("hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.add("hidden");
  }

  private getReactionsHtml(blockId: string): string {
    if (!this.reactions || this.reactions.length === 0) {
      return "";
    }

    const reactionsHtml = this.reactions
      .map(reaction => {
        return `
      <div class="au5-reaction ${reaction.className}" reaction-Id="${reaction.id}" reaction-type="${reaction.type}" data-blockId="${blockId}">
        <span class="au5-reaction-emoji">${reaction.emoji}</span>
        <div class="au5-reaction-users"></div>
      </div>`;
      })
      .join("");

    return `
      <div class="au5-message-reactions">
        <div class="au5-reaction-list">
          ${reactionsHtml}
        </div>
      </div>
    `;
  }
}
