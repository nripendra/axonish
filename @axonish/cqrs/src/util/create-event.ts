import { AggregateId } from "../common/aggregate-id";
import { forceConvert } from "./force-convert";
import { DomainEvent } from "../common/domain-event";

export function createEvent<TRequestPayload>(
  type: string,
  aggregateId?: AggregateId,
  payload?: TRequestPayload
) {
  if (aggregateId !== undefined && payload !== undefined) {
    return new DomainEvent<TRequestPayload>(type, payload, aggregateId);
  }
  return forceConvert<DomainEvent<TRequestPayload>>({ type });
}
