import {TranscriptBlock} from "../types";
import {toHoursAndMinutes} from "../utils/datetime";

export default class SidePanel {
  private static panelElement: HTMLDivElement | null = null;
  private static messagesContainer: HTMLDivElement | null = null;
  private static participantsContainer: HTMLDivElement | null = null;
  private static btnStartTranscription: HTMLDivElement | null = null;
  private static inputWrapper: HTMLDivElement | null = null;
  private static direction: "ltr" | "rtl" = "ltr";

  static createSidePanel(roomName: string, meetingId: string, direction: "ltr" | "rtl" = "ltr"): void {
    this.direction = direction;
    const style = document.createElement("style");
    style.textContent = chatPanelStyle;
    document.head.appendChild(style);

    const html = `
        <div class="au5-panel">
          <div class="au5-header">
            <div class="au5-header-left">
              <div>
                <div class="au5-room-name">${roomName}</div>
                <div class="au5-member-count">${meetingId}</div>
              </div>
            </div>
            <div class="au5-header-icons">
              <span class="au5-icon" id="au5-headerIcon-pause"> 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.65 19.11V4.89C10.65 3.54 10.08 3 8.64 3H5.01C3.57 3 3 3.54 3 4.89V19.11C3 20.46 3.57 21 5.01 21H8.64C10.08 21 10.65 20.46 10.65 19.11Z"
                    stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 19.11V4.89C21 3.54 20.43 3 18.99 3H15.36C13.93 3 13.35 3.54 13.35 4.89V19.11C13.35 20.46 13.92 21 15.36 21H18.99C20.43 21 21 20.46 21 19.11Z"
                    stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="au5-icon" id="au5-headerIcon-collapse"> 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2V22M18 22H6C3.79086 22 2 20.2091 2 18V6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22Z"
                    stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
      
          <div class="au5-participants-container au5-container"></div>
          <div class="au5-messages-container au5-container au5-hidden"></div>
          <div class="au5-footer">
            <button class="au5-start-btn au5-btn">Start Transcription</button>

            <div class="au5-input-wrapper au5-hidden">
              <div class="au5-input-container">
                <input type="text" class="au5-input" placeholder="پیام خود را بنویسید..." />
                <button class="au5-send-btn">ارسال</button>
              </div>
            </div>
          </div>
        </div>
      `;

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    this.panelElement = container.querySelector(".au5-panel") as HTMLDivElement;
    this.messagesContainer = container.querySelector(".au5-messages-container") as HTMLDivElement;
    this.participantsContainer = container.querySelector(".au5-participants-container") as HTMLDivElement;
    this.btnStartTranscription = container.querySelector(".au5-start-btn") as HTMLDivElement;
    this.inputWrapper = container.querySelector(".au5-input-wrapper") as HTMLDivElement;

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
        console.log("Collapse icon clicked");
        // Collapse action logic here
      });
    }
  }

  public static showMessagesContainer(): void {
    if (this.messagesContainer) {
      this.messagesContainer.classList.remove("au5-hidden");
      this.participantsContainer?.classList.add("au5-hidden");
      this.inputWrapper?.classList.remove("au5-hidden");
      this.btnStartTranscription?.classList.add("au5-hidden");
    }
  }

  public static destroy(): void {
    if (this.panelElement) {
      document.body.removeChild(this.panelElement);
      this.panelElement = null;
      this.messagesContainer = null;
    } else {
      console.warn("SidePanel not found.");
    }
  }
}

const chatPanelStyle = `
   /* Additional styles can be added here */
body {
  background-color: #333;
  font-family: system-ui;
}
.au5-panel {
  background-color: #fff;
  border-radius: 16px;
  bottom: 80px;
  box-sizing: border-box;
  max-width: 100%;
  position: absolute;
  right: 16px;
  top: 16px;
  transform: none;
  z-index: 9999;
  width: 360px;
  font-family: system-ui;
}

.au5-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.au5-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.au5-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.au5-avatar img {
  border-radius: 50%;
  width: 36px;
  height: 36px;
}

.au5-room-name {
  font-weight: bold;
  font-size: 14px;
}

.au5-member-count {
  font-size: 12px;
  color: #888;
}

.au5-header-icons {
  display: flex;
  gap: 8px;
}

.au5-header-icons .au5-icon {
  font-size: 16px;
  display: flex;
  cursor: pointer;
  border-radius: 4px;
  width: 28px;
  background-color: #f4f4f4f4;
  height: 28px;
  align-items: center;
  justify-content: center;
}

.au5-container {
  height: calc(100vh - 249px);
  overflow-y: auto;
  padding: 16px;
}

.au5-message {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 12px;
  position: relative;
}

.au5-bubble {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 8px 12px;
  flex: 1;
}

.au5-sender {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.au5-sender-title {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
}

.au5-text {
  font-size: 13px;
  margin-bottom: 16px;
  direction: rtl;
}

.au5-sender-time {
  font-size: 11px;
  color: #888;
  text-align: right;
}

.au5-message-reactions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.au5-reactions {
  display: flex;
  gap: 4px;
  left: 48px;
  bottom: 8px;
}

.au5-reactions .reaction {
  display: flex;
  gap: 4px;
  padding: 1px;
  border-radius: 100px;
  cursor: pointer;
  border: 1px solid #e5e5e5;
  transition: background-color 0.2s;
  background-color: #e4e4e4;
  align-items: center;
  align-content: center;
  min-width: 16px;
  max-height: 16px;
}

.au5-reactions .reaction-emoji {
  font-size: 12px;
  width: 16px;
  height: 16px;
}

.au5-reactions .reaction-users {
  display: flex;
  margin-left: 2px;
}

.au5-reactions .reaction-user {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid white;
  margin-left: -4px;
  display: flex;
}

.au5-reactions .reaction-user img {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.au5-btn {
  background: #2196f3;
  border: none;
  color: white;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 8px;
  height: 38px;
  margin-left: 8px;
  cursor: pointer;
  font-family: system-ui;
  width: -webkit-fill-available;
}

.au5-join-time {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin: 16px 0;
}

.au5-input-wrapper {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
}

.au5-input-container {
  display: flex;
  align-items: center;
  flex: 1;
  border: 1px solid #f4f4f4;
  padding: 6px;
  border-radius: 8px;
}

.au5-input {
  flex: 1;
  border: none;
  font-size: 14px;
  padding: 8px;
  border-radius: 8px;
  outline: none;
  font-family: system-ui;
}

.au5-hidden {
  display: none;
}

.au5-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px 16px;
}

`;
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
