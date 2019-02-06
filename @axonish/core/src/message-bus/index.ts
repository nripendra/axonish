import { IMessageBus } from "../interfaces/IMessageBus";
import { IChannel } from "../interfaces/IChannel";
import { Channel } from "../channel";

export class MessageBus implements IMessageBus {
  private _channels: { [id: string]: IChannel } = {};
  channel(channelName: string): IChannel {
    this._channels[channelName] =
      this._channels[channelName] || new Channel(channelName);
    return this._channels[channelName];
  }
}
