import { Command } from "../common/command";
import { ClassOf } from "@axonish/core";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { AggregateRootCommandHandlerFunction } from "../common/aggregate-root-metadata-types";

export type AggregateRootCommandHandlerType = {
  [key: string]: AggregateRootCommandHandlerFunction<unknown>;
};

export type AggregateRootCommandHandlerMetadata = {
  handlerFunction: AggregateRootCommandHandlerFunction<unknown>;
  aggregrateRootClass: ClassOf<AggregateRootCommandHandlerType>;
};

type AggregateRootCommandHandlerMetadataDictionary = {
  [commandType: string]: AggregateRootCommandHandlerMetadata[];
};

const aggregateRootCommandHandlerMetadata: AggregateRootCommandHandlerMetadataDictionary = {};

export function addAggregateRootCommandHandler(
  commandType: string,
  handlerFunction: AggregateRootCommandHandlerFunction<unknown>,
  aggregrateRootClass: ClassOf<IAggregateRoot>
) {
  const handlerMetadata =
    aggregateRootCommandHandlerMetadata[commandType] || [];
  handlerMetadata.push({
    handlerFunction,
    aggregrateRootClass: (aggregrateRootClass as unknown) as ClassOf<
      AggregateRootCommandHandlerType
    >
  });
  aggregateRootCommandHandlerMetadata[commandType] = handlerMetadata;
}

export function clearAggregateRootCommandHandler() {
  for (const key in aggregateRootCommandHandlerMetadata) {
    delete aggregateRootCommandHandlerMetadata[key];
  }
}

export function getAggregateRootCommandHandlers(commandType: string) {
  return aggregateRootCommandHandlerMetadata[commandType] || [];
}
