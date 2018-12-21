import { ClassOf } from "@axonish/core";
import { DomainEvent } from "../common/domain-event";
import { forceConvert } from "../util/force-convert";

export type ProjectionFunction = (
  event: DomainEvent<any>
) => Promise<void | {}> | void;

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
  handlerFunction: ProjectionFunction,
  projectionClass: unknown
) {
  if (projectionClass) {
    if (!Array.isArray(projectionHandlers[eventType])) {
      projectionHandlers[eventType] = [];
    }
    projectionHandlers[eventType].push({
      handlerFunction,
      projectionClass: forceConvert<ClassOf<ProjectionHandlerType>>(
        projectionClass
      )
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
