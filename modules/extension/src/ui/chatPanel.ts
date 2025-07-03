import {Entry, PauseAndPlayTranscriptionMessage, ReactionAppliedMessage, RequestToAddBotMessage} from "../core/types";
import {DateTime} from "../core/utils/datetime";
const DEFAULT_AVATAR_URL = "assets/icons/default-avatar.jpg";
export class ChatPanel {
  private unauthorizedContainerEl: HTMLElement | null;
  private noActiveMeetingEl: HTMLElement | null;
  private activeMeetingButNotStartedEl: HTMLElement | null;
  private activeMeetingEl: HTMLElement | null;
  private transcriptionsContainerEl: HTMLDivElement | null;
  private direction: "ltr" | "rtl" = "ltr";
  constructor() {
    this.unauthorizedContainerEl = document.getElementById("au5-userUnAuthorized");
    this.noActiveMeetingEl = document.getElementById("au5-noActiveMeeting");
    this.activeMeetingButNotStartedEl = document.getElementById("au5-activeMeetingButNotStarted");
    this.activeMeetingEl = document.getElementById("au5-activeMeeting");

    this.transcriptionsContainerEl = this.activeMeetingEl?.querySelector(
      ".au5-transcriptions-container"
    ) as HTMLDivElement;
  }

  public setDirection(direction: "ltr" | "rtl"): void {
    this.direction = direction;
  }

  public showUserUnAuthorizedContainer(): void {
    this.hideAllContainers();
    if (this.unauthorizedContainerEl) this.unauthorizedContainerEl.classList.remove("hidden");
  }

  public showNoActiveMeetingContainer(url: string): void {
    this.hideAllContainers();
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.remove("hidden");
    this.setUrl(url);
  }

  public showJoinMeetingContainer(url: string): void {
    this.hideAllContainers();
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.remove("hidden");
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

  public botJoined(botName: string): void {
    this.addUserJoinedOrLeaved(botName, true);
    if (!this.transcriptionsContainerEl) {
      return;
    }
    const botContainer = this.transcriptionsContainerEl.querySelector("#au5-addBot-container") as HTMLDivElement;
    if (botContainer) {
      botContainer.remove();
    }
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
      userSpan.src = `${reaction.user.pictureUrl}`;
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

      botRequested.innerText = `🤖 ${request.botName} bot requested by ${request.user.fullName}`;
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
  }

  public pauseAndPlay(action: PauseAndPlayTranscriptionMessage): void {
    if (!this.activeMeetingEl) {
      return;
    }

    const botPlayAction = this.activeMeetingEl.querySelector("#au5-bot-playAction") as HTMLDivElement;
    const botPauseAction = this.activeMeetingEl.querySelector("#au5-bot-puaseAction") as HTMLDivElement;
    if (!botPlayAction || !botPauseAction) {
      return;
    }
    if (action.isPaused === true) {
      botPlayAction.removeAttribute("style");
      botPauseAction.setAttribute("style", `display:none;`);
      this.addGeneralMessage("⏸️ Transcription paused by " + action.user.fullName);
    } else {
      botPlayAction.setAttribute("style", `display:none;`);
      botPauseAction.removeAttribute("style");
      this.addGeneralMessage("▶️ Transcription resumed by " + action.user.fullName);
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
        el.innerHTML = displayUrl;
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
    usersJoined.innerText = `${content} at ${DateTime.toHoursAndMinutes(new Date())}`;
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
    if (this.unauthorizedContainerEl) this.unauthorizedContainerEl.classList.add("hidden");
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.add("hidden");
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.add("hidden");
  }
}
