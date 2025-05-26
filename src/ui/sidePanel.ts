import {User} from "../core/types";
import {DateTime} from "../core/utils/datetime";
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

  static createSidePanel(companyName: string, meetingId: string, direction: "ltr" | "rtl" = "ltr"): void {
    this.direction = direction;

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
    nameDiv.textContent = user.fullname || "Unknown User";

    const joinedAtDiv = document.createElement("div");
    joinedAtDiv.className = "au5-participant-joinedAt";
    joinedAtDiv.textContent = `Joined at: ${new Date(user.joinedAt).toLocaleTimeString()}`;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(joinedAtDiv);
    participantElement.appendChild(img);
    participantElement.appendChild(infoDiv);

    this.participantsContainer.appendChild(participantElement);
  }

  public static addTranscription(block: any): void {
    console.log("Adding transcription block:", block);
    if (!this.transcriptionsContainer) {
      return;
    }

    const existing = this.transcriptionsContainer.querySelector(
      `[data-id="${block.transcriptionBlockId}"]`
    ) as HTMLDivElement;
    if (existing) {
      const textEl = existing.querySelector(".au5-text") as HTMLDivElement;
      if (textEl) textEl.innerText = block.transcript;
      return;
    }

    const transcriptBlock = document.createElement("div");
    transcriptBlock.setAttribute("data-id", block.transcriptionBlockId);
    transcriptBlock.className = "au5-transcription-header";
    transcriptBlock.innerHTML = `<div class="au5-avatar">
            <img
              src="${block.speaker.pictureUrl || "https://via.placeholder.com/40"}"
            />
          </div>
          <div class="au5-bubble">
            <div class="au5-sender">
              <div class="au5-sender-title">${block.speaker.fullName}</div>
              <div class="au5-sender-time">${DateTime.toHoursAndMinutes(block.time)}</div>
            </div>
            <div class="au5-text" style="direction: ${this.direction};">
              ${block.transcript}
            </div>
            <div class="au5-transcription-reactions">
              <div class="au5-reactions">
                <div class="reaction reaction-highlight">
                  <span class="reaction-emoji">⚡</span>
                </div>
                <div class="reaction reaction-mute">
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

// public static createPanel(direction: "ltr" | "rtl" = "ltr"): void {
//   if (this.panel) {
//     console.warn("ChatPanel already exists.");
//     return;
//   }

//   const style = document.createElement("style");
//   style.textContent = chatPanelStyle;
//   document.head.appendChild(style);

//   if (document.getElementById("au5-chat-panel")) return;

//   this.panel = document.createElement("div");
//   this.panel.id = "au5-chat-panel";
//   this.panel.className = "au5-chat-panel";
//   this.panel.setAttribute("data-direction", direction);
//   document.body.appendChild(this.panel);
// }

// public static hideParticipantList(): void {
//   this.participantContainer?.classList.add("au5-hidden");
// }

// public static addCurrentUser(name: string): void {
//   if (!this.panel) {
//     console.warn("ChatPanel not initialized.");
//     return;
//   }

//   this.participantContainer = document.createElement("div");
//   this.participantContainer.className = "au5-participant";

//   this.participantContainer.innerHTML = `
//     <ul class="au5-participant-list">
//       <li>${name}</li>
//     </ul>
//     <button id="au5-start-button">Start Transcription</button>
//   `;

//   this.panel.appendChild(this.participantContainer);
// }

// public static addParticipant(name: string): void {
//   if (!this.panel || !this.participantContainer) {
//     console.warn("ChatPanel or participant container not initialized.");
//     return;
//   }

//   const list = this.participantContainer.querySelector(".au5-participant-list") as HTMLUListElement;
//   if (list) {
//     const li = document.createElement("li");
//     li.innerText = name;
//     list.appendChild(li);
//   }
// }

// public static addMessage({id, speaker, transcript, timestamp}: TranscriptBlock): void {
//   if (!this.panel) return;

//   const direction = this.panel.getAttribute("data-direction") || "ltr";

//   const message = document.createElement("div");
//   message.className = "au5-message";
//   message.setAttribute("data-id", id);

//   message.innerHTML = `
//     <div class="au5-message-header">
//       <span class="au5-message-sender">${speaker}</span>
//       <span class="au5-message-time">${toHoursAndMinutes(timestamp)}</span>
//     </div>
//     <div class="au5-message-text" style="direction: ${direction};">${transcript}</div>
//   `;

//   this.panel.appendChild(message);
// }

// public static updateLiveMessage(item: TranscriptBlock): void {
//   if (!this.panel) {
//     console.warn("ChatPanel not initialized.");
//     return;
//   }

//   const existing = this.panel.querySelector(`[data-id="${item.id}"]`) as HTMLDivElement;
//   if (existing) {
//     const textEl = existing.querySelector(".au5-message-text") as HTMLDivElement;
//     if (textEl) textEl.innerText = item.transcript;
//   } else {
//     this.addMessage(item);
//   }
// }

// <div class="au5-input-wrapper">
//   <div class="au5-input-container">
//     <input type="text" class="au5-input" placeholder="پیام خود را بنویسید..." />
//     <button class="au5-send-btn">ارسال</button>
//   </div>
// </div>;
