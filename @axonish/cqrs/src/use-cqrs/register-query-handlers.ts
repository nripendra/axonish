import {
  IServiceConfiguration,
  MessageResponderToken,
  Message
} from "@axonish/core";
import { getAllQueryHandlers } from "../handles-query/metadata";

export function registerQueryHandlers(serviceConfig: IServiceConfiguration) {
  const responder = serviceConfig.services.get(MessageResponderToken);
  if (responder) {
    const queryQueryHandlers = getAllQueryHandlers();
    for (const queryType in queryQueryHandlers) {
      responder.on<unknown, unknown>(
        queryType,
        async (message: Message<unknown, unknown>) => {
          const { handlerFn, queryHandlerClass } = queryQueryHandlers[
            queryType
          ];
          const queryHandlerObj = serviceConfig.services.get(queryHandlerClass);
          return handlerFn.apply(queryHandlerObj, [message]);
        }
      );
    }
  }
}
