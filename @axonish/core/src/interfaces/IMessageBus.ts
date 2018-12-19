import IChannel from "./IChannel";

export default interface IMessageBus {
  channel(channelName: string): IChannel;
}
