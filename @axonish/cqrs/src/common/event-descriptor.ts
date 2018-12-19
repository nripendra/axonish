import { AggregateId } from "./aggregate-id";

export type EventDescriptor<T> = {
  type: string;
  payload: T;
  aggregateId: AggregateId;
  aggregateType: string;
};
