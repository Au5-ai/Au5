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
    botPlayContainer.innerHTML = `<div class="flex gap-[6px] min-w-[90px] max-w-[calc(100%-40px)]">
                                  <div class="text-xs overflow-hidden">
                                    <div
                                      class="model-btn flex justify-center items-center cursor-pointer ps-[6px] pe-[5px] py-[7px] leading-4 rounded-3xl gap-[2px]"
                                    >
                                      <div class="icon flex-center rounded-full size-4 ms-[1px] me-[2px]">
                                        <div
                                          class="flex items-center justify-center rounded-full"
                                          style="width: 18px; height: 18px"
                                        >
                                          <span
                                            class="inline-flex shrink-0 [&amp;&gt;svg]:size-[inherit]"
                                            style="width: 18px; height: 18px"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="24"
                                              height="24"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              stroke-width="2"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              class="lucide lucide-audio-waveform w-4 h-4"
                                            >
                                              <path
                                                d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"
                                              ></path>
                                            </svg>
                                          </span>
                                        </div>
                                      </div>
                                      <div
                                        class="flex items-center pl-[2px] pr-[2px] transition-transform duration-100"
                                      >
                                        ${botName}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div id="au5-bot-actionContainer" class="flex items-center ms-auto">
                                  <div
                                    id="au5-bot-puaseAction"
                                    class="topbar-btn size-[30px] model-btn model-btn-no-bg overflow-hidden flex-center text-xs p-[5px] rounded-lg"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M7.1 12.74V3.26C7.1 2.36 6.72 2 5.76 2H3.34C2.38 2 2 2.36 2 3.26V12.74C2 13.64 2.38 14 3.34 14H5.76C6.72 14 7.1 13.64 7.1 12.74Z"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                      <path
                                        d="M14.0001 12.74V3.26C14.0001 2.36 13.6201 2 12.6601 2H10.2401C9.28681 2 8.90015 2.36 8.90015 3.26V12.74C8.90015 13.64 9.28015 14 10.2401 14H12.6601C13.6201 14 14.0001 13.64 14.0001 12.74Z"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                    </svg>
                                  </div>
                                    <div
                                    id="au5-bot-playAction"
                                    class="topbar-btn size-[30px] model-btn model-btn-no-bg overflow-hidden flex-center text-xs p-[5px] rounded-lg hidden"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M2.66675 8V5.62667C2.66675 2.68 4.75341 1.47334 7.30675 2.94667L9.36675 4.13334L11.4267 5.32C13.9801 6.79334 13.9801 9.20667 11.4267 10.68L9.36675 11.8667L7.30675 13.0533C4.75341 14.5267 2.66675 13.32 2.66675 10.3733V8Z"
                                        stroke="currentColor"
                                        stroke-miterlimit="10"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                    </svg>
                                  </div>
                                </div>`;
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

  public pauseAndPlay(action: PauseAndPlayTranscriptionMessage): void {
    if (!this.activeMeetingEl) {
      return;
    }
    const botPlayContainer = this.activeMeetingEl.querySelector("#au5-bot-play") as HTMLDivElement;
    if (!botPlayContainer) {
      return;
    }
    const botPlayAction = this.activeMeetingEl.querySelector("#au5-bot-playAction") as HTMLDivElement;
    const botPauseAction = this.activeMeetingEl.querySelector("#au5-bot-puaseAction") as HTMLDivElement;
    if (!botPlayAction || !botPauseAction) {
      return;
    }
    if (action.isPaused === true) {
      botPlayAction.classList.remove("hidden");
      botPauseAction.classList.add("hidden");
      this.addGeneralMessage("⏸️ Transcription paused by " + action.user.fullName);
    } else {
      botPlayAction.classList.add("hidden");
      botPauseAction.classList.remove("hidden");
      this.addGeneralMessage("▶️ Transcription resumed by " + action.user.fullName);
    }
  }

  private setUrl(url: string): void {
    const urlElement = document.getElementsByClassName("au5-url");

    Array.from(urlElement).forEach((el: Element) => {
      if (el) {
        let displayUrl = url;
        if (url.length > 35) {
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
    usersJoined.innerText = `👋 ${content} at ${DateTime.toHoursAndMinutes(new Date())}`;
    this.transcriptionsContainerEl.appendChild(usersJoined);
    this.scrollToBottom();
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
