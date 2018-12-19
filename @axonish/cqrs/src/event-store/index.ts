import { EventEmitter } from "events";
import { PgDb, PgTable, ConnectionOptions } from "pogi";
import IEvent from "../interfaces/IEvent";
import IEventStore from "../interfaces/IEventStore";
import { Snap } from "../common/snap";
import { chunkArray } from "../util/chunk-array";
import { DomainEvent } from "../common/domain-event";
import { AggregateId } from "../common/aggregate-id";

const isSnap = (x: IEvent) => x.type === Snap.EVENT_TYPE;
const isNotSnap = (x: IEvent) => x.type !== Snap.EVENT_TYPE;
const toIEvent = (x: DomainEvent<unknown> | Snap<unknown>) => x.toEventData();
const fixIndex = (index: number) => (event: IEvent) => ({
  ...event,
  index: ++index,
  previousEventIndex: index - 1
});
const removeIdField = (e: IEvent) => {
  if (e.id === null || e.id === undefined) {
    delete e.id;
  }
  return e;
};
const removeSnapField = (e: IEvent) => {
  if (e.type === Snap.EVENT_TYPE) {
    delete e.type;
  }
  return e;
};
const toSnap = (x: IEvent) => Snap.fromEventData(x);

export default class PgEventStore extends EventEmitter implements IEventStore {
  private events: PgTable<IEvent> | null = null;
  private snaps: PgTable<Snap<unknown>> | null = null;

  async connect(connection: ConnectionOptions): Promise<IEventStore> {
    const db: PgDb = await PgDb.connect(connection as ConnectionOptions);
    this.events = db.tables.events;
    this.snaps = db.tables.snaps;
    return this as IEventStore;
  }

  async saveEvents(
    eventDescriptors: Array<{
      aggregateId: AggregateId;
      events: Array<DomainEvent<unknown> | Snap<unknown>>;
      expectedVersion: number;
    }>
  ): Promise<void> {
    const finalEvents: IEvent[] = [];
    for (const descriptor of eventDescriptors) {
      const { aggregateId, expectedVersion } = descriptor;
      const aggregateEvents: IEvent[] = descriptor.events.map(toIEvent);
      const latestEvent: IEvent | null = await this.getLatestEvent(aggregateId);
      let index: number = latestEvent ? latestEvent.index : 0;
      if (expectedVersion !== -1 && index !== expectedVersion) {
        throw new Error(
          `Concurrency exception occured while saving events.
          AggregateId = ${aggregateId} expectedVersion = (${expectedVersion}) actual = (${index})`
        );
      }

      finalEvents.push(...aggregateEvents.map(fixIndex(index)));
    }

    const chunks: IEvent[][] = chunkArray(finalEvents, 10000);
    if (this.events !== null && this.snaps !== null) {
      for (const chunk of chunks) {
        const finalChunk = chunk.map(removeIdField);

        const events = finalChunk.filter(isNotSnap);
        const snaps = finalChunk.filter(isSnap).map(removeSnapField);

        const eventInsertResult = this.events.insert(events);
        const snapInsertResult = this.snaps.insert(snaps as Snap<unknown>[]);
        await Promise.all([eventInsertResult, snapInsertResult]);
        this.emit("saved events", chunk);
      }
    }
  }

  async getLatestSnapshot(aggregateId: AggregateId): Promise<Snap<unknown> | null> {
    if (this.snaps !== null) {
      const data: Snap<unknown> = await this.snaps.findOne(
        { aggregateId },
        {
          limit: 1,
          orderBy: ["index asc", "created_at asc"]
        }
      );
      if (data) {
        return toSnap(data);
      }
    }
    return null;
  }

  async getEventsByLatestSnapShot(
    aggregateId: AggregateId
  ): Promise<Array<DomainEvent<unknown> | Snap<unknown> | null>> {
    if (this.events !== null && this.snaps !== null) {
      const lastSnap: IEvent | null = await this.getLatestSnapshot(aggregateId);
      const snapIndex = lastSnap ? lastSnap.index : 0;
      const events: IEvent[] = await this.events.find(
        { aggregateId, "index >": snapIndex },
        {
          orderBy: ["index asc", "created_at asc"]
        }
      );
      if (lastSnap != null) {
        events.unshift(lastSnap);
      }

      return events.map((event: IEvent) => {
        if (event.type && event.aggregateId) {
          if (event.type === Snap.EVENT_TYPE) {
            return Snap.fromEventData(event);
          }
          return DomainEvent.fromEventData(event);
        }
        return null;
      });
    }
    return [];
  }

  async getLatestEvent(
    aggregateId: AggregateId
  ): Promise<DomainEvent<unknown> | null> {
    if (this.events !== null) {
      const events: IEvent[] = await this.events.find(
        { aggregateId },
        {
          limit: 1,
          orderBy: { index: "desc", created_at: "desc" }
        }
      );
      if (events.length) {
        const event: IEvent = events[0];
        if (event && event.type) {
          return DomainEvent.fromEventData(event);
        }
      }
    }
    return null;
  }

  async _clear_for_test(): Promise<void> {
    if (this.snaps !== null) {
      await this.snaps.delete({});
    }
    if (this.events !== null) {
      await this.events.delete({});
    }
  }
}
