import { IChannel } from "./IChannel";

export interface IMessageBus {
  channel(channelName: string): IChannel;
}
