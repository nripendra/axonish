import { DomainEvent } from "./domain-event";
import { Command } from "./command";

export type AggregateRootEventHandlerFunction<TEventPayload> = (
  event: DomainEvent<TEventPayload>,
  isHistoricalEvent: boolean
) => Promise<void> | void;

export type AggregateRootEventHandlerDictionary = {
  [eventType: string]: AggregateRootEventHandlerFunction<unknown>;
};

export type AggregateRootCommandHandlerFunction<
  TCommandPayload,
  TCommandResponse
> = (event: Command<TCommandPayload, TCommandResponse>) => Promise<void> | void;

export type AggregateRootCommandHandlerDictionary = {
  [commandType: string]: AggregateRootCommandHandlerFunction<unknown, unknown>;
};
