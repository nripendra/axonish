import { Message } from "@axonish/core";
import { AggregateId } from "./aggregate-id";
import { IEvent } from "../interfaces/IEvent";
import { AxonishContext } from "../axonish-context";
import { IAggregateRoot } from "..";

export class DomainEvent<T> extends Message<T, void> implements IEvent {
  _ctx: AxonishContext | undefined;
  get ctx() {
    return this._ctx;
  }
  set ctx(value: AxonishContext | undefined) {
    if (value !== undefined && value !== null) {
      this._ctx = value;
      this.aggregateType = (value.aggregateRoot as IAggregateRoot).aggregateTypeName;
    }
  }
  id?: number | undefined;
  previousEventIndex?: number | undefined;
  public aggregateType?: string;
  index: number = 0;
  constructor(
    type: string,
    public payload: T,
    public aggregateId: AggregateId
  ) {
    super(type, payload);
  }

  static fromEventData<T>(eventData: IEvent): DomainEvent<T> {
    const domainEvent = new DomainEvent<T>(
      eventData.type,
      eventData.payload as T,
      eventData.aggregateId
    );
    domainEvent.aggregateType = eventData.aggregateType;
    domainEvent.id = eventData.id;
    domainEvent.index = eventData.index;
    domainEvent.previousEventIndex = eventData.previousEventIndex;
    return domainEvent;
  }
  toEventData(): IEvent {
    return {
      type: this.type,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      index: this.index,
      payload: this.payload,
      previousEventIndex: this.previousEventIndex,
      id: this.id
    };
  }
}
