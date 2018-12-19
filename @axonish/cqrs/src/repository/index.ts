import { IRepository } from "../interfaces/IRepository";
import IEventStore from "../interfaces/IEventStore";
import IEvent from "../interfaces/IEvent";
import Container from "typedi";
import { AggregateId } from "../common/aggregate-id";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { DomainEvent } from "../common/domain-event";
import { Snap } from "../common/snap";
import { forceConvert } from "../util/force-convert";
import { isNullOrUndefined } from "util";
import { IEventStoreItem } from "../interfaces/IEventStoreItem";

export class Repository implements IRepository {
  constructor(private eventStore: IEventStore) {}

  async find<TAggregate>(
    aggregateType: new (...args: unknown[]) => TAggregate,
    aggregateId: AggregateId
  ): Promise<TAggregate | null> {
    try {
      const events: Array<
        DomainEvent<unknown> | Snap<unknown> | null
      > = await this.eventStore.getEventsByLatestSnapShot(aggregateId);
      if (events && events.length > 0) {
        const aggregateRootInstance = Container.get(aggregateType) as unknown;
        // Need to set initial state....
        forceConvert<IAggregateRoot>(aggregateRootInstance).load(events);
        forceConvert<IAggregateRoot>(
          aggregateRootInstance
        ).aggregateId = aggregateId;
        return aggregateRootInstance as TAggregate;
      }
    } catch (e) {
      // console.log(e);
      throw e;
    }
    return null;
  }

  async save(aggregates: unknown[]): Promise<void> {
    try {
      const eventDescriptors: IEventStoreItem[] = forceConvert<
        IAggregateRoot[]
      >(aggregates)
        .map((aggregate: IAggregateRoot) => {
          const events: Array<DomainEvent<unknown> | Snap<unknown>> =
            aggregate.uncommittedEvents || [];
          const expectedVersion: number = aggregate.lastEventIndex || -1;
          return {
            aggregateId: aggregate.aggregateId as AggregateId,
            events,
            expectedVersion
          };
        })
        .filter(
          aggregate =>
            (!isNullOrUndefined(aggregate.aggregateId) &&
              aggregate.events &&
              aggregate.events.length > 0) ||
            false
        );

      if (eventDescriptors.length > 0) {
        await this.eventStore.saveEvents(eventDescriptors);
      }
    } catch (e) {
      // console.log(e);
      throw e;
    }
  }
}
