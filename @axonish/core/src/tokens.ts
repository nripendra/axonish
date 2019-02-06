import { Token } from "typedi";
import { IMessageBus } from "./interfaces/IMessageBus";
import { IMessageResponder } from "./interfaces/IMessageResponder";
import { IApiConfiguration } from "./interfaces/IApiConfiguration";
import { IServiceConfiguration } from "./interfaces/IServiceConfiguration";
import { IMessagePublisher } from "./interfaces/IMessagePublisher";
import { IMessageSubscriber } from "./interfaces/IMessageSubscriber";

export const MessageBusToken = new Token<IMessageBus>();
export const MessageResponderToken = new Token<IMessageResponder>();
export const MessagePublisherToken = new Token<IMessagePublisher>();
export const MessageSubscriberToken = new Token<IMessageSubscriber>();
export const ApiConfigurationToken = new Token<IApiConfiguration>();
export const ServiceConfigurationToken = new Token<IServiceConfiguration>();
