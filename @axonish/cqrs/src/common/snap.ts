import IEvent from "../interfaces/IEvent";

export class Snap implements IEvent {
  static get EVENT_TYPE() {
    return "Snap";
  }
  static fromEventData(eventData: IEvent | null): Snap | null {
    if (eventData) {
      if (eventData.aggregateId) {
        const snap: Snap = new Snap(
          eventData.payload,
          eventData.aggregateType,
          eventData.aggregateId
        );
        snap.index = eventData.index;
        snap.previousEventIndex = eventData.previousEventIndex || 0;
        snap.id = eventData.id || 0;
        return snap;
      }
    }
    return null;
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
  get eventType(): string {
    return Snap.EVENT_TYPE;
  }
  id: number = 0;
  index: number = 0;
  previousEventIndex: number = 0;
  constructor(
    public payload: unknown,
    public aggregateType: string,
    public aggregateId: string
  ) {}
}
