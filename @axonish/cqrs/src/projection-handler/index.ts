import { AggregateRootEventHandlerDictionary } from "../common/aggregate-root-metadata-types";
import { addProjectionHandler, ProjectionFunction } from "./metadata";
import { ClassOf } from "@axonish/core";

export function Projection() {
  return (constructor: ClassOf<unknown>) => {
    if (constructor.prototype.__handlesEvent) {
      const __handlesEvent: any = constructor.prototype.__handlesEvent;
      for (const key in __handlesEvent) {
        const handler: ProjectionFunction = __handlesEvent[key];
        addProjectionHandler(key, handler, constructor);
      }
      delete constructor.prototype.__handlesEvent;
    }
  };
}
