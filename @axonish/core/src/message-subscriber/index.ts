import IMessageSubscriber from "../interfaces/IMessageSubscriber";
import { Message } from "../common/message";
import { ResponderCallback } from "../common/responder-callback";
import * as cote from "cote";

export class MessageSubscriber implements IMessageSubscriber {
  private _subscriber: cote.Subscriber;
  constructor(serviceName: string) {
    this._subscriber = new cote.Subscriber({
      name: "Axonish Message Subscriber",
      namespace: serviceName
    });
  }
  on<TPayload>(
    messageType: string | Message<TPayload, void>,
    listener: ResponderCallback<TPayload, void>
  ): void {
    messageType =
      typeof messageType == "string" ? messageType : messageType.type;
    this._subscriber.on(
      messageType,
      async (message: Message<TPayload, void>) => {
        try {
          listener(message);
        } catch (error) {
          // Todo: log error
        }
      }
    );
  }
  close(): void {
    this._subscriber.close();
  }
}
