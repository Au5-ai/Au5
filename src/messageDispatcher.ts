import {ExtensionMessage, ExtensionResponse} from "./types";

export class MessageDispatcher {
  private handlers: MessageHandler[];

  constructor(handlers: MessageHandler[]) {
    this.handlers = handlers;
  }

  dispatch(message: ExtensionMessage, sendResponse: (response: ExtensionResponse) => void): boolean {
    for (const handler of this.handlers) {
      if (handler.canHandle(message)) {
        handler.handle(message, sendResponse);
        return true;
      }
    }

    console.warn(`No handler found for message type: ${message.type}`);
    return false;
  }
}
