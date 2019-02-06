import { IChannel } from "../interfaces/IChannel";
import { Requester } from "cote";
import { Message } from "../common/message";

export class Channel implements IChannel {
  private _requester: Requester;
  constructor(channelName: string) {
    this._requester = new Requester({
      name: channelName + " Requester",
      namespace: channelName
    });
  }
  async send<T, U>(request: Message<T, U>): Promise<U> {
    try {
      return await this._requester.send(request);
    } catch (e) {
      if (e.stackTrace) {
        e.stack = e.stack || e.stackTrace;
        delete e.stackTrace;
        e.toString = () => e.errorStr;
      }
      throw e;
    }
  }
}
