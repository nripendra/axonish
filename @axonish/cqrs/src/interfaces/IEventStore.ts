import IEvent from "./IEvent";
import { Snap } from "../common/snap";
import { AggregateId } from "../common/aggregate-id";
import { DomainEvent } from "../common/domain-event";
export default interface IEventStore {
  connect(connection: unknown): Promise<IEventStore>;
  saveEvents(
    eventDescriptors: Array<{
      aggregateId: AggregateId;
      events: Array<DomainEvent<unknown> | Snap<unknown>>;
      expectedVersion: number;
    }>
  ): Promise<void>;
  getLatestSnapshot(aggregateId: AggregateId): Promise<Snap<unknown> | null>;
  /**
   * Gets the last snap-shot and all events after the snapshot.
   * @param aggregateId
   */
  getEventsByLatestSnapShot(
    aggregateId: AggregateId
  ): Promise<Array<DomainEvent<unknown> | Snap<unknown> | null>>;
  getLatestEvent(
    aggregateId: AggregateId
  ): Promise<DomainEvent<unknown> | null>;
}
