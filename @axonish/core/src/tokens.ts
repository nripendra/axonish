import { Token } from "typedi";
import IMessageBus from "./interfaces/IMessageBus";

export const MessageBusService = new Token<IMessageBus>();
