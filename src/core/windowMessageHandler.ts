import {IMessage} from "../socket/types";

type MessageCallback = (action: string, payload: any) => void;

export class WindowMessageHandler {
  private callback: MessageCallback;
  private sourceGet: string;
  private sourcePost: string;
  constructor(sourceGet: string, sourcePost: string, callback: MessageCallback) {
    this.callback = callback;
    this.sourceGet = sourceGet;
    this.sourcePost = sourcePost;
    window.addEventListener("message", this.handleMessage);
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.source !== window || event.data.source !== this.sourceGet) return;
    const {action, payload} = event.data;
    this.callback(action, payload);
  };

  public postToWindow(msg: IMessage) {
    window.postMessage(
      {
        source: this.sourcePost,
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
