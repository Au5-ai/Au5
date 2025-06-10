import {IMessage} from "./types";

type MessageCallback = (action: string, payload: any) => void;

export class WindowMessageHandler {
  private callback: MessageCallback;
  private from: string;
  private to: string;
  constructor(from: string, to: string, callback: MessageCallback) {
    this.callback = callback;
    this.from = from;
    this.to = to;
    window.addEventListener("message", this.handleMessage);
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.source !== window || event.data.source !== this.to) return;
    const {action, payload} = event.data;
    this.callback(action, payload);
  };

  public postToWindow(msg: IMessage) {
    window.postMessage(
      {
        source: this.from,
        action: msg.type,
        payload: msg
      },
      "*"
    );
  }

  public dispose() {
    window.removeEventListener("message", this.handleMessage);
  }
}
