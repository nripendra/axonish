import {
  IServiceConfiguration,
  MessagePublisherToken,
  MessagePublisher,
  MessageSubscriberToken,
  MessageSubscriber
} from "@axonish/core";
import { ICqrsConfiguration } from "../interfaces/ICqrsConfiguration";
import { CqrsConfiguration } from "../common/cqrs-configuration";
import { registerCommandHandlers } from "./register-command-handlers";
import { registerEventReactors } from "./register-event-reactors";
import { registerQueryHandlers } from "./register-query-handlers";

type UseCqrsCallback = (cqrsConfig: ICqrsConfiguration) => Promise<void> | void;
export async function useCqrs(
  serviceConfig: IServiceConfiguration,
  callback: UseCqrsCallback
): Promise<void> {
  const cqrsConfig = new CqrsConfiguration(serviceConfig);

  serviceConfig.services.set({
    id: MessagePublisherToken,
    value: new MessagePublisher(serviceConfig.serviceName)
  });
  serviceConfig.services.set({
    id: MessageSubscriberToken,
    value: new MessageSubscriber(serviceConfig.serviceName)
  });

  attachResponders(serviceConfig);

  const result = callback(cqrsConfig);
  if (result && result.then) {
    await result;
  }
}
function attachResponders(serviceConfig: IServiceConfiguration) {
  serviceConfig.onDone(() => {
    registerCommandHandlers(serviceConfig);
    registerEventReactors(serviceConfig);
    registerQueryHandlers(serviceConfig);
  });
}
