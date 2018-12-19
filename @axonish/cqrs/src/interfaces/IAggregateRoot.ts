import { AggregateId } from "../common/aggregate-id";
import { DomainEvent } from "../common/domain-event";
import IEvent from "./IEvent";
import { AggregateRootEventHandlerFunction } from "../common/aggregate-root-metadata-types";
import { Snap } from "../common/snap";

export default interface IAggregateRoot {
  aggregateId?: AggregateId;
  getState<T>(): T;
  setState<T>(state: T): void;
  committedEvents: Array<DomainEvent<unknown> | Snap<unknown>>;
  uncommittedEvents: Array<DomainEvent<unknown> | Snap<unknown>>;
  lastEventIndex?: number;
  load(eventHistory: Array<DomainEvent<unknown> | Snap<unknown> | null>): void;

  applyEvent<TEventPayload>(
    event: DomainEvent<TEventPayload> | Snap<TEventPayload>,
    handler: AggregateRootEventHandlerFunction<TEventPayload>,
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
