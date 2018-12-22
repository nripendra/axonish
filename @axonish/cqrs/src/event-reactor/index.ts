import { AggregateRootEventHandlerDictionary } from "../common/aggregate-root-metadata-types";
import { addEventReactorEventHandler, ReactorFunction } from "./metadata";
import { ClassOf } from "@axonish/core";

export function EventReactor() {
  return (constructor: ClassOf<unknown>) => {
    if (constructor.prototype.__handlesEvent) {
      const __handlesEvent: any = constructor.prototype.__handlesEvent;
      for (const key in __handlesEvent) {
        const handler: ReactorFunction<unknown> = __handlesEvent[key];
        addEventReactorEventHandler(key, handler, constructor);
      }
      delete constructor.prototype.__handlesEvent;
    }
  };
}
