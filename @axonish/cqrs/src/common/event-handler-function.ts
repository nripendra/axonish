import { DomainEvent } from "./domain-event";

export type EventHandlerFunction<TEventPayload> = (
  event: DomainEvent<TEventPayload>,
  isHistoricalEvent: boolean
) => Promise<void> | void;
