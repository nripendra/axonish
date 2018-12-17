import { Token } from "typedi";
import IMessageBus from "./interfaces/IMessageBus";
import IMessageResponder from "./interfaces/IMessageResponder";
import IApiConfiguration from "./interfaces/IApiConfiguration";
import IServiceConfiguration from "./interfaces/IServiceConfiguration";

export const MessageBusToken = new Token<IMessageBus>();
export const MessageResponderToken = new Token<IMessageResponder>();
export const ApiConfigurationToken = new Token<IApiConfiguration>();
export const ServiceConfigurationToken = new Token<IServiceConfiguration>();
