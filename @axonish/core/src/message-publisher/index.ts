import { IMessagePublisher } from "../interfaces/IMessagePublisher";
import { Message } from "../common/message";
import { Publisher } from "cote";

export class MessagePublisher implements IMessagePublisher {
  private _publisher: Publisher;
  constructor(channelName: string) {
    this._publisher = new Publisher({
      name: channelName + " Publisher",
      namespace: channelName
    });
  }
  publish<TPayload>(message: Message<TPayload, void>): void {
    this._publisher.publish(message.type, message);
  }
}
