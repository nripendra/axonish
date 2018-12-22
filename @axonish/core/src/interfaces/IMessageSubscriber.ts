import { Message } from "../common/message";
import { ResponderCallback } from "../common/responder-callback";

export default interface IMessageSubscriber {
  on<TPayload>(
    messageOrType: Message<TPayload, void> | string,
    listener: ResponderCallback<TPayload, void>
  ): void;
  close(): void;
}
