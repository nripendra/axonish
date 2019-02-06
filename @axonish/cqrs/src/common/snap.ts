import { IEvent } from "../interfaces/IEvent";
import { Message } from "@axonish/core";
import { AxonishContext } from "../axonish-context";
import { IAggregateRoot } from "..";

export class Snap<TPayload> extends Message<TPayload, void> implements IEvent {
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
  public aggregateType?: string;
  static get EVENT_TYPE() {
    return "Snap";
  }
  static fromEventData<TPayload>(
    eventData: IEvent | null
  ): Snap<TPayload> | null {
    if (eventData) {
      if (eventData.aggregateId) {
        const snap: Snap<TPayload> = new Snap(
          eventData.payload as TPayload,
          eventData.aggregateId
        );
        snap.index = eventData.index;
        snap.previousEventIndex = eventData.previousEventIndex || 0;
        snap.id = eventData.id || 0;
        snap.aggregateType = eventData.aggregateType;
        return snap;
      }
    }
    return null;
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
  get type(): string {
    return Snap.EVENT_TYPE;
  }
  set type(value: string) {}
  id: number = 0;
  index: number = 0;
  previousEventIndex: number = 0;
  constructor(public payload: TPayload, public aggregateId: string) {
    super(Snap.EVENT_TYPE, payload);
  }
}
