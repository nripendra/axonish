import { IEvent } from "./IEvent";
import { Snap } from "../common/snap";
export interface IEventStore {
  createSnap(snap: Snap): Promise<any>;
  saveEvents(
    eventDescriptors: Array<{
      aggregateId: string;
      events: IEvent[];
      expectedVersion: number;
    }>
  ): Promise<any>;
  getLatestSnapshot(aggregateId: string): Promise<Snap | null>;
  getEventsAndSnap(aggregateIds: string[]): Promise<IEvent[]>;
  getEvents(aggregateId: string): Promise<IEvent[]>;
  getLatestEvent(aggregateId: string): Promise<IEvent | null>;
  getEventsBySnapshot(snapId: number): Promise<IEvent[]>;
  getSnapshotByIndex(aggregateId: string, index: number): Promise<Snap>;
  getSnapshotByLastIndex(
    aggregateId: string,
    index: number
  ): Promise<Snap | null>;
  getSnapshotById(id: number): Promise<Snap>;
  getEventById(id: number): Promise<IEvent | null>;
}
