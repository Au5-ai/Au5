import {TranscriptBlock} from "../types";
import {toHoursAndMinutes} from "../utils/datetime";

export default class ChatPanel {
  private static chatPanel: HTMLDivElement | null = null;

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

  public static addMessage(item: TranscriptBlock): void {
    if (!this.chatPanel) return;

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
    if (!this.chatPanel) return;

    const existingMessage = this.chatPanel.querySelector(`[data-id="${item.id}"]`) as HTMLElement;
    console.log("existingMessage", existingMessage);
    console.log("item", item);
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

`;

// const elementsToStyle = [
//   {className: "fJsklc ZmuLbd Didmac G03iKb", styles: {top: "0px", right: "376px", left: "0px"}},
//   {className: "axUSnc cZXVke  P9KVBf", styles: {inset: "72px 392px 80px 16px"}}
// ];

// elementsToStyle.forEach(({className, styles}) => {
//   const elements = document.getElementsByClassName(className);
//   Array.from(elements).forEach(element => {
//     Object.assign((element as HTMLElement).style, styles);
//   });
// });

// const element = document.getElementsByClassName("dkjMxf i8wGAe iPFm3e")[0] as HTMLElement;
// if (element) {
//   element.style.width = parseInt(element.style.width, 10) - 376 + "px";
// }
