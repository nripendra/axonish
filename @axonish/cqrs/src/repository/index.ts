import { IRepository } from "../interfaces/IRepository";
import { IEventStore } from "../interfaces/IEventStore";
import { AggregateId } from "../common/aggregate-id";
import { IAggregateRoot } from "../interfaces/IAggregateRoot";
import { DomainEvent } from "../common/domain-event";
import { Snap } from "../common/snap";
import { forceConvert } from "../util/force-convert";
import { isNullOrUndefined } from "util";
import { IEventStoreItem } from "../interfaces/IEventStoreItem";
import { AxonishContext, getAxonishContext } from "../axonish-context";
import { IServiceConfiguration, ClassOf } from "@axonish/core";
import { createNewAggregateRoot } from "../aggregate-root";

const filterNull = (x: DomainEvent<unknown> | Snap<unknown> | null) =>
  x != null;

const applyCtx = (ctx: AxonishContext) => (
  x: DomainEvent<unknown> | Snap<unknown> | null
) => x && (x.ctx = ctx);

export class Repository implements IRepository {
  constructor(
    private eventStore: IEventStore,
    private serviceConfig: IServiceConfiguration
  ) {}

  async find<TAggregate>(
    aggregateType: ClassOf<TAggregate>,
    aggregateId: AggregateId
  ): Promise<TAggregate | null> {
    if (!aggregateId) {
      return null;
    }

    try {
      const events: Array<
        DomainEvent<unknown> | Snap<unknown> | null
      > = await this.eventStore.getEventsByLatestSnapShot(aggregateId);
      if (events && events.length > 0) {
        const aggregateRootInstance = createNewAggregateRoot(
          forceConvert<ClassOf<IAggregateRoot>>(aggregateType),
          aggregateId,
          this.serviceConfig
        );

        const ctx = getAxonishContext(
          aggregateRootInstance,
          this.serviceConfig
        );

        events.filter(filterNull).forEach(applyCtx(ctx));
        // Need to set initial state?
        aggregateRootInstance.load(events);
        return forceConvert<TAggregate>(aggregateRootInstance);
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
