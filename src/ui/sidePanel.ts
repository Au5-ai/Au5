import {PostMessageTypes} from "../core/constants";
import {TranscriptionEntry, User} from "../core/types";
import {AppConfiguration} from "../core/types/configuration";
import {DateTime} from "../core/utils/datetime";
import {ReactionAppliedMessage} from "../socket/types";
import {MessageTypes} from "../socket/types/enums";
import css from "./styles/au5-panel.css?raw";

export default class SidePanel {
  private static panelElement: HTMLDivElement | null = null;
  private static transcriptionsContainer: HTMLDivElement | null = null;
  private static participantsContainer: HTMLDivElement | null = null;
  private static btnStartTranscription: HTMLDivElement | null = null;
  private static inputWrapper: HTMLDivElement | null = null;
  private static header: HTMLDivElement | null = null;
  private static footer: HTMLDivElement | null = null;
  private static direction: "ltr" | "rtl" = "ltr";

  static createSidePanel(config: AppConfiguration, meetingId: string): void {
    this.direction = config.service.direction || "ltr";

    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);

    const html = `
        <div class="au5-panel">
            <div class="au5-header">
              <div class="au5-header-left">
                <div class="au5-company-avatar">${companyName.at(0)?.toUpperCase()}</div>
                <div>
                  <div class="au5-company-name">${companyName}</div>
                  <div class="au5-room-title">${meetingId}</div>
                </div>
              </div>
              <div class="au5-header-icons">
                <span class="au5-icon" id="au5-headerIcon-pause">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10.65 19.11V4.89C10.65 3.54 10.08 3 8.64 3H5.01C3.57 3 3 3.54 3 4.89V19.11C3 20.46 3.57 21 5.01 21H8.64C10.08 21 10.65 20.46 10.65 19.11Z"
                      stroke="#292D32"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M21 19.11V4.89C21 3.54 20.43 3 18.99 3H15.36C13.93 3 13.35 3.54 13.35 4.89V19.11C13.35 20.46 13.92 21 15.36 21H18.99C20.43 21 21 20.46 21 19.11Z"
                      stroke="#292D32"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="au5-icon" id="au5-headerIcon-collapse">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 2V22M18 22H6C3.79086 22 2 20.2091 2 18V6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22Z"
                      stroke="#28303F"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </div>
           </div>
             
      
          <div class="au5-participants-container au5-container"></div>
          <div class="au5-transcriptions-container au5-container au5-hidden"></div>
           <div class="au5-footer">
              <button id="au5-startTranscription-btn" class="au5-startTranscription-btn au5-btn">Start Transcription</button>
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

    this.panelElement = container.querySelector(".au5-panel") as HTMLDivElement;
    this.transcriptionsContainer = container.querySelector(".au5-transcriptions-container") as HTMLDivElement;
    this.participantsContainer = container.querySelector(".au5-participants-container") as HTMLDivElement;
    this.btnStartTranscription = container.querySelector(".au5-startTranscription-btn") as HTMLDivElement;
    this.inputWrapper = container.querySelector(".au5-input-wrapper") as HTMLDivElement;
    this.header = container.querySelector(".au5-header") as HTMLDivElement;
    this.footer = container.querySelector(".au5-footer") as HTMLDivElement;

    const pauseButton = container.querySelector("#au5-headerIcon-pause");
    const collapseButton = container.querySelector("#au5-headerIcon-collapse");

    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        console.log("Pause icon clicked");
        // Pause action logic here
      });
    }

    if (collapseButton) {
      collapseButton.addEventListener("click", () => {
        if (collapseButton.classList.contains("au5-icon-selected")) {
          collapseButton.classList.remove("au5-icon-selected");
          this.header?.classList.remove("au5-header-collapse");
          this.participantsContainer?.classList.remove("au5-hidden");
          this.transcriptionsContainer?.classList.remove("au5-hidden");
          this.footer?.classList.remove("au5-hidden");
          return;
        }

        collapseButton.classList.add("au5-icon-selected");
        this.header?.classList.add("au5-header-collapse");
        this.participantsContainer?.classList.add("au5-hidden");
        this.transcriptionsContainer?.classList.add("au5-hidden");
        this.footer?.classList.add("au5-hidden");
      });
    }

    this.transcriptionsContainer.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Traverse up if span is clicked instead of the div
      const reaction = target.closest(".reaction") as HTMLElement;
      if (!reaction) return;

      const blockId = reaction.getAttribute("data-blockId");
      const reactionType = reaction.getAttribute("reaction-type");
      if (blockId) {
        const payload: ReactionAppliedMessage = {
          transcriptBlockId: blockId,
          reaction: reactionType || "task",
          meetingId: meetingId,
          type: MessageTypes.ReactionApplied,
          user: {
            id: config.user.userId,
            fullName: config.user.fullName,
            pictureUrl: config.user.pictureUrl
          }
        };
        console.log("Reaction clicked:", payload);

        window.postMessage(
          {
            source: PostMessageTypes.ContentScript,
            action: payload.type,
            payload: payload
          },
          "*"
        );
      }
    });
  }

  public static addParticipant(user: User): void {
    if (!this.participantsContainer) {
      return;
    }

    const participantElement = document.createElement("div");
    participantElement.className = "au5-participant";

    const img = document.createElement("img");
    img.src = user.pictureUrl;
    img.alt = "Participant Avatar";

    const infoDiv = document.createElement("div");
    infoDiv.className = "au5-participant-info";

    const nameDiv = document.createElement("div");
    nameDiv.className = "au5-participant-name";
    nameDiv.textContent = user.fullName || "Unknown User";

    const joinedAtDiv = document.createElement("div");
    joinedAtDiv.className = "au5-participant-joinedAt";
    joinedAtDiv.textContent = `Joined at: ${DateTime.toHoursAndMinutes(user.joinedAt || new Date())}`;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(joinedAtDiv);
    participantElement.appendChild(img);
    participantElement.appendChild(infoDiv);

    this.participantsContainer.appendChild(participantElement);
  }

  public static usersJoined(user: User, isMeetStarted: boolean): void {
    if (isMeetStarted) {
      this.addUserJoinedOrLeaved(user, true);
    } else {
      this.addParticipant(user);
    }
  }

  public static usersLeaved(user: User, isMeetStarted: boolean): void {
    if (isMeetStarted) {
      this.addUserJoinedOrLeaved(user, false);
    } else {
      this.addParticipant(user);
    }
  }

  private static addUserJoinedOrLeaved(user: User, isJoined: boolean): void {
    if (!this.transcriptionsContainer) {
      return;
    }
    const usersJoined = document.createElement("div");
    usersJoined.className = "au5-join-time";
    usersJoined.innerText = `${user.fullName} ${isJoined ? "Joined" : "Leaved"} at ${DateTime.toHoursAndMinutes(
      user.joinedAt || new Date()
    )}`;
    this.transcriptionsContainer.appendChild(usersJoined);
  }

  public static addTranscription(entry: TranscriptionEntry): void {
    if (!this.transcriptionsContainer) {
      return;
    }

    const existing = this.transcriptionsContainer.querySelector(
      `[data-id="${entry.transcriptBlockId}"]`
    ) as HTMLDivElement;
    if (existing) {
      const textEl = existing.querySelector(".au5-text") as HTMLDivElement;
      if (textEl) textEl.innerText = entry.transcript;
      return;
    }

    const transcriptBlock = document.createElement("div");
    transcriptBlock.setAttribute("data-id", entry.transcriptBlockId);
    transcriptBlock.className = "au5-transcription";
    transcriptBlock.innerHTML = `<div class="au5-avatar">
            <img
              src="${entry.speaker.pictureUrl || "https://i.sstatic.net/34AD2.jpg"}"
            />
          </div>
          <div class="au5-bubble">
            <div class="au5-sender">
              <div class="au5-sender-title">${entry.speaker.fullName}</div>
              <div class="au5-sender-time">${DateTime.toHoursAndMinutes(entry.timestamp)}</div>
            </div>
            <div class="au5-text" style="direction: ${this.direction};">
              ${entry.transcript}
            </div>
            <div class="au5-transcription-reactions">
              <div class="au5-reactions">
                <div class="reaction" reaction-type="task" data-blockId="${entry.transcriptBlockId}">
                  <span class="reaction-emoji">⚡</span>
                </div>
                <div class="reaction" reaction-type="important" data-blockId="${entry.transcriptBlockId}">
                  <span class="reaction-emoji">🎯</span>
                </div>
              </div>
            </div>
          </div>`;

    this.transcriptionsContainer.appendChild(transcriptBlock);
  }

  public static showTranscriptionsContainer(): void {
    if (this.transcriptionsContainer) {
      this.transcriptionsContainer.classList.remove("au5-hidden");
      this.inputWrapper?.classList.remove("au5-hidden");
      this.participantsContainer?.remove();
      this.participantsContainer = null;
      this.btnStartTranscription?.classList.add("au5-hidden");
    }
  }

  public static addReaction(reaction: ReactionAppliedMessage): void {
    if (!this.transcriptionsContainer) {
      return;
    }

    const transcriptionBlock = this.transcriptionsContainer.querySelector(
      `[data-id="${reaction.transcriptBlockId}"]`
    ) as HTMLDivElement;

    if (!transcriptionBlock) {
      console.warn("Transcription block not found for reaction:", reaction);
      return;
    }

    const reactionsContainer = transcriptionBlock.querySelector(".au5-reactions") as HTMLDivElement;
    if (!reactionsContainer) {
      console.warn("Reactions container not found in transcription block.");
      return;
    }

    const existingReaction = reactionsContainer.querySelector(
      `.reaction[reaction-type="${reaction.reaction}"]`
    ) as HTMLDivElement;

    if (existingReaction) {
      const userSpan = document.createElement("div");
      userSpan.className = "reaction-user";
      userSpan.innerHTML = `<div class="reaction-user">
                               <img src="${reaction.user.pictureUrl}" />
                            </div>`;
      existingReaction.appendChild(userSpan);
    }
  }
  public static destroy(): void {
    if (this.panelElement) {
      if (document.body.contains(this.panelElement)) {
        this.panelElement.remove();
      } else {
        console.warn("SidePanel exists but is not attached to document.body.");
      }

      this.panelElement = null;
      this.transcriptionsContainer = null;
    } else {
      console.warn("SidePanel not found.");
    }
  }
}
