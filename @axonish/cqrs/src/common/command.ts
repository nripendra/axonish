import { Message } from "@axonish/core";
import { AggregateId } from "./aggregate-id";
import { CommandResponse } from "./command-response";
import { AxonishContext } from "../axonish-context";

export class Command<TPayload, TResponsePayload> extends Message<
  TPayload,
  CommandResponse<TResponsePayload>
> {
  ctx?: AxonishContext;
  constructor(
    type: string,
    payload: TPayload,
    public aggregateId: AggregateId
  ) {
    super(type, payload);
  }
}
