import { Message } from "../common/message";
import { ResponderCallback } from "../common/responder-callback";

export interface IMessageSubscriber {
  on<TPayload>(
    messageOrType: Message<TPayload, void> | string,
    listener: ResponderCallback<TPayload, void>
  ): void;
  close(): void;
}
