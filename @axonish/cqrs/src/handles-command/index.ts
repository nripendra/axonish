import { AggregateRootCommandHandlerDictionary } from "../common/aggregate-root-metadata-types";
import { Command } from "../common/command";
import { forceConvert } from "../util/force-convert";

export type HandlesCommandPrototype = {
  [key: string]: () => void;
} & { __handlesCommand?: AggregateRootCommandHandlerDictionary };

export function HandlesCommand<TRequestPayload, TReponsePayload>(
  command: Command<TRequestPayload, TReponsePayload>
) {
  return function methodDecorator(
    targetPrototype: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (targetPrototype != null && propertyKey) {
      const commandName: string = command.type;
      const prototype = forceConvert<HandlesCommandPrototype>(targetPrototype);

      const commandHandlers: AggregateRootCommandHandlerDictionary =
        prototype.__handlesCommand || {};
      const handlerFn = prototype[propertyKey];
      if (handlerFn instanceof Function) {
        commandHandlers[commandName] = handlerFn;
        prototype.__handlesCommand = commandHandlers;
      }
    }
  };
}
