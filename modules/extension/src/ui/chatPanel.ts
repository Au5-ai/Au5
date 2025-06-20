import {ReactionAppliedMessage, TranscriptionEntry, User, UserJoinedInMeetingMessage} from "../core/types";
import {DateTime} from "../core/utils/datetime";

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
    console.log("No active meeting for URL:", url);
    this.hideAllContainers();
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.remove("hidden");
    this.setUrl(url);
  }

  public showJoinMeetingContainer(url: string): void {
    this.hideAllContainers();
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.remove("hidden");
    this.setUrl(url);
  }

  public showTranscriptionContainer(companyNameText: string, roomTitleText: string): void {
    const headerElement = document.querySelector(".au5-header") as HTMLElement;
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

  public addTranscription(entry: TranscriptionEntry): void {
    if (!this.transcriptionsContainerEl) {
      console.error("Transcriptions container element not found.");
      return;
    }

    const existing = this.transcriptionsContainerEl.querySelector(
      `[data-id="${entry.transcriptBlockId}"]`
    ) as HTMLDivElement;
    if (existing) {
      const textEl = existing.querySelector(".au5-message-text") as HTMLDivElement;
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
          <div class="au5-reaction au5-reaction-highlight" reaction-type="task" data-blockId="${
            entry.transcriptBlockId
          }">
            <span class="au5-reaction-emoji">⚡</span>
            <div class="au5-reaction-users"></div>
          </div>

          <div class="au5-reaction au5-reaction-mute" reaction-type="important" data-blockId="${
            entry.transcriptBlockId
          }">
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

  public usersJoined(data: UserJoinedInMeetingMessage): void {
    this.addUserJoinedOrLeaved(data.user, true);
  }

  public usersLeaved(data: UserJoinedInMeetingMessage): void {
    this.addUserJoinedOrLeaved(data.user, false);
  }

  public addReaction(reaction: ReactionAppliedMessage): void {
    if (!this.transcriptionsContainerEl) {
      return;
    }

    const transcriptionBlock = this.transcriptionsContainerEl.querySelector(
      `[data-id="${reaction.transcriptBlockId}"]`
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
        `[data-user-name="${reaction.user.fullName || ""}"]`
      ) as HTMLImageElement;

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

  private setUrl(url: string): void {
    const urlElement = document.getElementsByClassName("au5-url");

    Array.from(urlElement).forEach((el: Element) => {
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
  private addUserJoinedOrLeaved(user: User, isJoined: boolean): void {
    if (!this.transcriptionsContainerEl) {
      return;
    }
    const usersJoined = document.createElement("div");
    usersJoined.className = "au5-join-time";
    usersJoined.innerText = `👋 ${user.fullName} ${isJoined ? "Joined" : "Leaved"} at ${DateTime.toHoursAndMinutes(
      new Date()
    )}`;
    this.transcriptionsContainerEl.appendChild(usersJoined);
    this.scrollToBottom();
  }

  private addHeader(companyNameText: string, roomTitleText: string): void {
    const headerElement = document.querySelector(".au5-header") as HTMLElement;
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

  private scrollToBottom(): void {
    if (this.activeMeetingEl) {
      this.activeMeetingEl.scrollTo({
        top: this.activeMeetingEl.scrollHeight,
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
