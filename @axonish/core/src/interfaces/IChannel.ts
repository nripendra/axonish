import { Message } from "../common/message";

export default interface IChannel {
  send<T, U>(message: Message<T, U>): Promise<U>;
}
