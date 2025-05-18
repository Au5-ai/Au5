import {TranscriptBlock} from "../types";
import {toHoursAndMinutes} from "../utils/datetime";

export default class ChatPanel {
  private static panel: HTMLDivElement | null = null;
  private static participantContainer: HTMLDivElement | null = null;

  public static createPanel(direction: "ltr" | "rtl" = "ltr"): void {
    if (this.panel) {
      console.warn("ChatPanel already exists.");
      return;
    }

    const style = document.createElement("style");
    style.textContent = chatPanelStyle;
    document.head.appendChild(style);

    if (document.getElementById("au5-chat-panel")) return;

    this.panel = document.createElement("div");
    this.panel.id = "au5-chat-panel";
    this.panel.className = "au5-chat-panel";
    this.panel.setAttribute("data-direction", direction);
    document.body.appendChild(this.panel);
  }

  public static hideParticipantList(): void {
    this.participantContainer?.classList.add("au5-hidden");
  }

  public static addCurrentUser(name: string): void {
    if (!this.panel) {
      console.warn("ChatPanel not initialized.");
      return;
    }

    this.participantContainer = document.createElement("div");
    this.participantContainer.className = "au5-participant";

    this.participantContainer.innerHTML = `
      <ul class="au5-participant-list">
        <li>${name}</li>
      </ul>
      <button id="au5-start-button">Start Transcription</button>
    `;

    this.panel.appendChild(this.participantContainer);
  }

  public static addParticipant(name: string): void {
    if (!this.panel || !this.participantContainer) {
      console.warn("ChatPanel or participant container not initialized.");
      return;
    }

    const list = this.participantContainer.querySelector(".au5-participant-list") as HTMLUListElement;
    if (list) {
      const li = document.createElement("li");
      li.innerText = name;
      list.appendChild(li);
    }
  }

  public static addMessage({id, speaker, transcript, timestamp}: TranscriptBlock): void {
    if (!this.panel) return;

    const direction = this.panel.getAttribute("data-direction") || "ltr";

    const message = document.createElement("div");
    message.className = "au5-message";
    message.setAttribute("data-id", id);

    message.innerHTML = `
      <div class="au5-message-header">
        <span class="au5-message-sender">${speaker}</span>
        <span class="au5-message-time">${toHoursAndMinutes(timestamp)}</span>
      </div>
      <div class="au5-message-text" style="direction: ${direction};">${transcript}</div>
    `;

    this.panel.appendChild(message);
  }

  public static updateLiveMessage(item: TranscriptBlock): void {
    if (!this.panel) {
      console.warn("ChatPanel not initialized.");
      return;
    }

    const existing = this.panel.querySelector(`[data-id="${item.id}"]`) as HTMLDivElement;
    if (existing) {
      const textEl = existing.querySelector(".au5-message-text") as HTMLDivElement;
      if (textEl) textEl.innerText = item.transcript;
    } else {
      this.addMessage(item);
    }
  }

  public static destroy(): void {
    if (this.panel) {
      document.body.removeChild(this.panel);
      this.panel = null;
      this.participantContainer = null;
    } else {
      console.warn("ChatPanel not found.");
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
