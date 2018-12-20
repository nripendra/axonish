import { Message } from "../common/message";

export default interface IMessagePublisher {
  publish<TPayload>(message: Message<TPayload, void>): void;
}
