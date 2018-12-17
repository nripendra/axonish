import IMessageResponder from "../interfaces/IMessageResponder";
import { Message } from "../common/message";
import { ResponderCallback } from "../common/responder-callback";
import * as cote from "cote";

export class MessageResponder implements IMessageResponder {
  private _responder: cote.Responder;
  constructor(serviceName: string) {
    this._responder = new cote.Responder({
      name: "Axonish Message Responder",
      namespace: serviceName
    });
  }
  on<T, U>(
    messageType: string | Message<T, U>,
    listener: ResponderCallback<T, U>
  ): void {
    messageType =
      typeof messageType == "string" ? messageType : messageType.type;
    this._responder.on(messageType, async (message: Message<T, U>) => {
      try {
        return await listener(message);
      } catch (error) {
        // Looks like cote doesn't work well with Error type??
        const errorStr = error.toString();
        const obj = {
          name: error.name,
          message: error.message,
          stackTrace: error.stack,
          errorStr
        };
        throw obj;
      }
    });
  }
  close(): void {
    this._responder.close();
  }
}
