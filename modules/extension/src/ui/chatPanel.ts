import {TranscriptionEntry, User} from "../core/types";
import {DateTime} from "../core/utils/datetime";

export class ChatPanel {
  private noActiveMeetingEl: HTMLElement | null;
  private activeMeetingButNotStartedEl: HTMLElement | null;
  private activeMeetingEl: HTMLElement | null;
  private footerEl: HTMLElement | null;
  private transcriptionsContainerEl: HTMLDivElement | null;

  constructor(private direction: "ltr" | "rtl" = "ltr") {
    this.noActiveMeetingEl = document.getElementById("au5-noActiveMeeting");
    this.activeMeetingButNotStartedEl = document.getElementById("au5-activeMeetingButNotStarted");
    this.activeMeetingEl = document.getElementById("au5-activeMeeting");
    this.footerEl = document.getElementById("au5-transcription-footer") as HTMLElement;
    this.transcriptionsContainerEl = this.activeMeetingEl?.querySelector(
      ".au5-transcriptions-container"
    ) as HTMLDivElement;
  }

  public showNoActiveMeetingContainer(): void {
    if (this.noActiveMeetingEl) this.noActiveMeetingEl.classList.remove("au5-hidden");
  }

  public showJoinMeetingContainer(): void {
    if (this.activeMeetingButNotStartedEl) this.activeMeetingButNotStartedEl.classList.remove("au5-hidden");
  }

  public showTranscriptionContainer(companyNameText: string, roomTitleText: string): void {
    const headerElement = document.querySelector(".au5-header") as HTMLElement;
    if (!headerElement) return;
    headerElement.classList.remove("au5-hidden");
    this.addHeader(companyNameText, roomTitleText);

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

  public usersJoined(user: User): void {
    this.addUserJoinedOrLeaved(user, true);
  }

  public usersLeaved(user: User): void {
    this.addUserJoinedOrLeaved(user, false);
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
}
