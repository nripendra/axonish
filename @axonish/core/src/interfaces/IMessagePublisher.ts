import { Message } from "../common/message";

export interface IMessagePublisher {
  publish<TPayload>(message: Message<TPayload, void>): void;
}
