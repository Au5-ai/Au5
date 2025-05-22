import {InjectedScriptAllowedActions, Message} from "./types";

type MessageCallback = (action: string, payload: any) => void;

export class WindowMessageHandler {
  private callback: MessageCallback;

  constructor(callback: MessageCallback) {
    this.callback = callback;
    window.addEventListener("message", this.handleMessage);
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.source !== window || event.data.source !== "Au5-ContentScript") return;
    const {action, payload} = event.data;
    this.callback(action, payload);
  };

  public postToWindow(msg: Message) {
    window.postMessage(
      {
        source: "Au5-InjectedScript",
        action: msg.header.type,
        payload: msg.payload
      },
      "*"
    );
  }

  public dispose() {
    window.removeEventListener("message", this.handleMessage);
  }
}
