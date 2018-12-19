import { Message } from "@axonish/core";
import { AggregateId } from "./aggregate-id";
import { CommandResponse } from "./command-response";

export class Command<TPayload, TResponsePayload> extends Message<
  TPayload,
  CommandResponse<TResponsePayload>
> {
  constructor(
    type: string,
    payload: TPayload,
    public aggregateId: AggregateId
  ) {
    super(type, payload);
  }
}
