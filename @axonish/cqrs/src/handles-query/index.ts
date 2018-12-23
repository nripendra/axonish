import { Message, ClassOf } from "@axonish/core";
import { addQueryHandler } from "./metadata";

export function HandlesQuery<TPayload, TResponse>(
  query: Message<TPayload, TResponse>
) {
  return function methodDecorator(
    targetPrototype: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (targetPrototype != null && propertyKey) {
      const queryTypeName: string = query.type;
      if (targetPrototype[propertyKey] instanceof Function) {
        addQueryHandler(
          queryTypeName,
          targetPrototype[propertyKey],
          targetPrototype.constructor
        );
      }
    }
  };
}
