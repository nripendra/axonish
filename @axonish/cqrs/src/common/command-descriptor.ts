import { AggregateId } from "./aggregate-id";

export type CommandDescriptor<T> = {
  type: string;
  payload: T;
  aggregateId: AggregateId;
};
