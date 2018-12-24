import { AggregateId } from "../common/aggregate-id";
import { Command } from "../common/command";
import { forceConvert } from "./force-convert";

export function createCommand<TRequestPayload, TResponsePayload>(
  type: string,
  aggregateId?: AggregateId,
  payload?: TRequestPayload
) {
  if (aggregateId !== undefined && payload !== undefined) {
    return new Command<TRequestPayload, TResponsePayload>(
      type,
      payload,
      aggregateId
    );
  }
  return forceConvert<Command<TRequestPayload, TResponsePayload>>({ type });
}
