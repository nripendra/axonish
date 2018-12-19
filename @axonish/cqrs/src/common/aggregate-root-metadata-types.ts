import { DomainEvent } from "./domain-event";

export type AggregateRootEventHandlerFunction<TEventPayload> = (
  event: DomainEvent<TEventPayload>,
  isHistoricalEvent: boolean
) => Promise<void> | void;

export type AggregateRootEventHandlerDictionary = {
  [eventType: string]: AggregateRootEventHandlerFunction<unknown>;
};
