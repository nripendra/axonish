import { AggregateId } from "../common/aggregate-id";

export default interface IEvent {
  id?: number;
  aggregateId: AggregateId;
  index: number;
  previousEventIndex?: number;
  payload: unknown;
  type: string;
  aggregateType?: string;
}
