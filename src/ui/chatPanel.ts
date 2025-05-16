import {TranscriptBlock} from "../types";
import {toHoursAndMinutes} from "../utils/datetime";

export default class ChatPanel {
  private static chatPanel: HTMLDivElement | null = null;
  private static participants: HTMLDivElement | null = null;

  public static addPanel(direction: string): void {
    if (this.chatPanel) {
      console.warn("ChatPanel already exists.");
      return;
    }

    // Inject style
    const style = document.createElement("style");
    style.textContent = chatPanelStyle;
    document.head.appendChild(style);

    if (document.getElementById("au5-chat-panel")) return;

    this.chatPanel = document.createElement("div");
    this.chatPanel.id = "au5-chat-panel";
    this.chatPanel.className = "au5-chat-panel";
    this.chatPanel.setAttribute("data-direction", direction);
    document.body.appendChild(this.chatPanel);
  }
  public static HideParticipantList(): void {
    this.participants?.classList.add("au5-hidden");
  }

  public static addYou(name: string): void {
    if (!this.chatPanel) {
      console.warn("ChatPanel does not exist.");
      return;
    }

    this.participants = document.createElement("div");
    this.participants.className = "au5-participant";

    this.participants.innerHTML = `
        <ul class="au5-participant-list">
          <li>${{name}}</li>
        </ul>

      <button id="au5-start-button">Start Transcription</button>
`;

    this.chatPanel.appendChild(this.participants);
  }

  public static addOthers(name: string): void {
    if (!this.chatPanel) {
      console.warn("ChatPanel does not exist.");
      return;
    }

    const participantList = this.participants?.getElementsByClassName(`au5-participant-list"`)[0] as HTMLElement;
    if (participantList) {
      const other = document.createElement("li");
      other.innerText = name;
      participantList.appendChild(other);
    }
  }

  public static addMessage(item: TranscriptBlock): void {
    if (!this.chatPanel) {
      return;
    }

    const direction = this.chatPanel.getAttribute("data-direction") || "ltr";

    const message = document.createElement("div");
    message.className = "au5-message";
    message.setAttribute("data-id", item.id);

    message.innerHTML = `
    <div class="au5-message-header">
      <span class="au5-message-sender">${item.speaker}</span>
      <span class="au5-message-time">${toHoursAndMinutes(item.timestamp)}</span>
    </div>
    <div class="au5-message-text" style="direction: ${direction};">${item.transcript}</div>
  `;

    this.chatPanel.appendChild(message);
  }

  public static addLiveMessage(item: TranscriptBlock): void {
    if (!this.chatPanel) {
      console.warn("ChatPanel does not exist.");
      return;
    }
    const existingMessage = this.chatPanel.querySelector(`[data-id="${item.id}"]`) as HTMLElement;
    if (existingMessage) {
      const textDiv = existingMessage.querySelector(".au5-message-text") as HTMLElement;
      if (textDiv) {
        textDiv.innerText = item.transcript;
      }
    } else {
      ChatPanel.addMessage(item);
    }
  }

  public static destroy(): void {
    if (this.chatPanel) {
      document.body.removeChild(this.chatPanel);
      this.chatPanel = null;
    } else {
      console.warn("ChatPanel does not exist.");
    }
  }
}

const chatPanelStyle = `
  .au5-chat-panel {
    border: 1px solid transparent;
    align-items: center;
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
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    width: 360px;
    padding: 16px;
    overflow-x: auto;
    font-family: system-ui;
  }

  #au5-start-button {
    background-color: rgb(0, 0, 0);
    color: white; 
    border-radius: 8px; 
    padding: 8px; 
    border: none; 
    cursor: pointer;
  }

  .au5-message {
    background-color: #f1f2f3;
    padding: 16px;
    border-radius: 16px;
    max-width: 500px;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.6;
    color: #000;
  }

  .au5-message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .au5-message-sender {
    font-weight: bold;
    font-size: 13px;
  }

  .au5-message-time {
    color: #333;
    font-size: 13px;
  }

  .au5-message-text {
    margin-bottom: 8px;
  }
  
  .au5-hidden {
    display: none;
  }
`;
