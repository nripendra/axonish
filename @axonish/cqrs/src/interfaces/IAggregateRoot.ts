import { AggregateId } from "../common/aggregate-id";
import { DomainEvent } from "../common/domain-event";
import IEvent from "./IEvent";
import { EventHandlerFunction } from "../common/event-handler-function";
import { Snap } from "../common/snap";

export default interface IAggregateRoot {
  aggregateId?: AggregateId;
  getState<T>(): T;
  committedEvents: Array<DomainEvent<unknown> | Snap<unknown>>;
  uncommittedEvents: Array<DomainEvent<unknown> | Snap<unknown>>;
  lastEventIndex?: number;
  load(eventHistory: IEvent[]): void;

  applyEvent<TEventPayload>(
    event: DomainEvent<TEventPayload> | Snap<TEventPayload>,
    handler: EventHandlerFunction<TEventPayload>,
    isUncommittedEvent: boolean
  ): void;

  commit(): Promise<void>;

  uncommit(): void;

  /**
   * Apply a snapshot
   */
  applySnapShot<TPayload>(
    snapShot: Snap<TPayload>,
    isHistoricalSnapShot: boolean
  ): void;

  /**
   * Logic to create snapshot
   */
  createSnap<TPayload>(): Snap<TPayload> | null;
}
