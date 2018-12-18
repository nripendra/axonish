import { Message } from "@axonish/core";
import { AggregateId } from "./aggregate-id";
import IEvent from "../interfaces/IEvent";

export class DomainEvent<T> extends Message<T, void> implements IEvent {
  id?: number | undefined;
  previousEventIndex?: number | undefined;
  index: number = 0;
  constructor(
    public eventType: string,
    public payload: T,
    public aggregateType: string,
    public aggregateId?: AggregateId
  ) {
    super(eventType, payload);
  }

  static fromEventData<T>(eventData: IEvent): DomainEvent<T> {
    const domainEvent = new DomainEvent<T>(
      eventData.eventType,
      eventData.payload as T,
      eventData.aggregateType,
      eventData.aggregateId
    );
    domainEvent.id = eventData.id;
    domainEvent.index = eventData.index;
    domainEvent.previousEventIndex = eventData.previousEventIndex;
    return domainEvent;
  }
  toEventData(): IEvent {
    return {
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      index: this.index,
      payload: this.payload,
      previousEventIndex: this.previousEventIndex,
      id: this.id
    };
  }
}
