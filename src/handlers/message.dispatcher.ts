import {IExtensionMessage, IExtensionResponse, IMessageHandler} from "../types";

export class MessageDispatcher {
  private handlers: IMessageHandler[];

  constructor(handlers: IMessageHandler[]) {
    this.handlers = handlers;
  }

  dispatch(message: IExtensionMessage, sendResponse: (response: IExtensionResponse) => void): boolean {
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
