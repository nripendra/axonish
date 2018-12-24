import { AggregateId } from "../common/aggregate-id";
import { forceConvert } from "./force-convert";
import { Message } from "@axonish/core";

export function createQuery<TRequestPayload, TResponsePayload>(
  type: string,
  payload?: TRequestPayload
) {
  if (payload !== undefined) {
    return new Message<TRequestPayload, TResponsePayload>(type, payload);
  }
  return forceConvert<Message<TRequestPayload, TResponsePayload>>({ type });
}
