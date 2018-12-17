import { Message } from "../common/message";
import { ResponderCallback } from "../common/responder-callback";

export default interface IMessageResponder {
  on<T, U>(
    messageType: string | Message<T, U>,
    listener: ResponderCallback<T, U>
  ): void;

  close(): void;
}
