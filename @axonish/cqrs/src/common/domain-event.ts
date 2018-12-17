import { Message } from "@axonish/core";
import { AggregateId } from "./aggregate-id";
import { IEvent } from "../interfaces/IEvent";

export class DomainEvent<T> extends Message<T, {}> implements IEvent {
  id?: number | undefined;
  previousEventIndex?: number | undefined;
  payload: any;
  eventType?: string | undefined;
  index: number = 0;
  constructor(type: string, payload: T, public aggregateId?: AggregateId) {
    super(type, payload);
  }
}
