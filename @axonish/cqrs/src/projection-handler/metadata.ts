import { ClassOf } from "@axonish/core";
import { DomainEvent } from "../common/domain-event";

export type ProjectionFunction = (
  state: unknown,
  event: DomainEvent<unknown>
) => Promise<void> | void;

export type ProjectionHandlerType = {
  [key: string]: ProjectionFunction;
};

export type ProjectionMetadata = {
  handlerFunction: ProjectionFunction;
  projectionClass: ClassOf<ProjectionHandlerType>;
};
const projectionHandlers: {
  [eventType: string]: ProjectionMetadata[];
} = {};
export function addProjectionHandler(
  eventType: string,
  handlerFunctionName: string,
  target: unknown
) {
  const projectionClass = target as ClassOf<ProjectionHandlerType>;
  if (
    projectionClass &&
    projectionClass.prototype &&
    projectionClass.prototype[handlerFunctionName]
  ) {
    if (!Array.isArray(projectionHandlers[eventType])) {
      projectionHandlers[eventType] = [];
    }

    const handlerFunction = projectionClass.prototype[handlerFunctionName];
    projectionHandlers[eventType].push({
      handlerFunction,
      projectionClass
    });
  }
}
export function clearProjectionHandlers() {
  for (const key in projectionHandlers) {
    delete projectionHandlers[key];
  }
}

export function getProjectionHandlers(
  eventType: string
): ProjectionMetadata[] | undefined {
  return projectionHandlers[eventType];
}
