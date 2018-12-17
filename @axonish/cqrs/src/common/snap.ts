import { IEvent } from "../interfaces/IEvent";

export class Snap implements IEvent {
  static parse(data: IEvent): Snap {
    const snap: Snap = new Snap(data.payload);
    snap.aggregateId = data.aggregateId || "";
    snap.index = data.index;
    snap.previousEventIndex = data.previousEventIndex || 0;
    snap.id = data.id || 0;
    return snap;
  }
  get eventType(): string {
    return "Snap";
  }
  id: number = 0;
  index: number = 0;
  previousEventIndex: number = 0;
  aggregateId: string = "";
  constructor(public payload: unknown) {}
}
