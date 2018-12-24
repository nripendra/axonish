import { AggregateId } from "../common/aggregate-id";
import { DomainEvent } from "../common/domain-event";
import { Snap } from "../common/snap";

export default interface IEventStoreItem {
  aggregateId: AggregateId;
  events: Array<DomainEvent<unknown> | Snap<unknown>>;
  expectedVersion: number;
}
