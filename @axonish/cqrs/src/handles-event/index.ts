import { DomainEvent } from "../common/domain-event";
import { ClassOf } from "@axonish/core";
import {
  AggregateRootEventHandlerFunction,
  AggregateRootEventHandlerDictionary
} from "../common/aggregate-root-metadata-types";
import { forceConvert } from "../util/force-convert";

export type HandlesEventPrototype = {
  [key: string]: () => void;
} & { __handlesEvent?: AggregateRootEventHandlerDictionary };
export function HandlesEvent<TRequestPayload>(
  event: DomainEvent<TRequestPayload>
) {
  return function methodDecorator(
    targetPrototype: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (targetPrototype != null && propertyKey) {
      const eventName: string = event.type;
      const prototype = forceConvert<HandlesEventPrototype>(targetPrototype);

      const eventHandlers: AggregateRootEventHandlerDictionary =
        prototype.__handlesEvent || {};
      const handlerFn = prototype[propertyKey];
      if (handlerFn instanceof Function) {
        eventHandlers[eventName] = handlerFn;
        prototype.__handlesEvent = eventHandlers;
      }
    }
  };
}
