import { AggregateId } from "../common/aggregate-id";
import { DomainEvent } from "../common/domain-event";
import IEvent from "./IEvent";
import { EventHandlerFunction } from "../common/event-handler-function";
import { Snap } from "../common/snap";

export default interface IAggregateRoot {
  aggregateId?: AggregateId;
  getState<T>(): T;
  committedEvents: Array<DomainEvent<unknown> | Snap>;
  uncommittedEvents: Array<DomainEvent<unknown> | Snap>;
  lastEventIndex?: number;
  load(eventHistory: IEvent[]): void;

  applyEvent<TEventPayload>(
    event: DomainEvent<unknown> | Snap,
    handler: EventHandlerFunction<TEventPayload>,
    isUncomittedEvent: boolean
  ): void;

  commit(): Promise<void>;

  uncommit(): void;

  /**
   * Apply a snapshot
   */
  applySnapShot(snapShot: Snap, isHistoricalSnapShot: boolean): void;

  /**
   * Logic to create snapshot
   */
  createSnap(): Snap;
}
