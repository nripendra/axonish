import { Message } from "../common/message";

export interface IChannel {
  send<T, U>(message: Message<T, U>): Promise<U>;
}
