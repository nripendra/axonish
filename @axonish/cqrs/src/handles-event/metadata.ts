import { DomainEvent } from "../common/domain-event";
import { ClassOf } from "@axonish/core";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { AggregateRootEventHandlerFunction } from "../common/aggregate-root-metadata-types";

export type AggregateRootEventHandlerType = {
  [key: string]: AggregateRootEventHandlerFunction<unknown>;
};

export type AggregateRootEventHandlerMetadata = {
  handlerFunction: AggregateRootEventHandlerFunction<unknown>;
  aggregrateRootClass: ClassOf<AggregateRootEventHandlerType>;
};

type AggregateRootEventHandlerMetadataDictionary = {
  [eventType: string]: AggregateRootEventHandlerMetadata[];
};

const aggregateRootEventHandlerMetadata: AggregateRootEventHandlerMetadataDictionary = {};

export function addAggregateRootEventHandler(
  eventType: string,
  handlerFunction: AggregateRootEventHandlerFunction<unknown>,
  aggregrateRootClass: ClassOf<IAggregateRoot>
) {
  const handlerMetadata = aggregateRootEventHandlerMetadata[eventType] || [];
  handlerMetadata.push({
    handlerFunction,
    aggregrateRootClass: (aggregrateRootClass as unknown) as ClassOf<
      AggregateRootEventHandlerType
    >
  });
  aggregateRootEventHandlerMetadata[eventType] = handlerMetadata;
}

export function clearAggregateRootEventHandler() {
  for (const key in aggregateRootEventHandlerMetadata) {
    delete aggregateRootEventHandlerMetadata[key];
  }
}

export function getAggregateRootEventHandlers(eventType: string) {
  return aggregateRootEventHandlerMetadata[eventType] || [];
}
