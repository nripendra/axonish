import {
  IServiceConfiguration,
  MessagePublisherToken,
  MessagePublisher
} from "@axonish/core";
import IEventStore from "../interfaces/IEventStore";
import ICqrsConfiguration from "../interfaces/ICqrsConfiguration";
import { CqrsConfiguration } from "../common/cqrs-configuration";
import { EventStoreToken } from "../tokens";
import { registerCommandHandlers } from "./register-command-handlers";

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

  attachResponders(serviceConfig);

  const result = callback(cqrsConfig);
  if (result && result.then) {
    await result;
  }
}
function attachResponders(serviceConfig: IServiceConfiguration) {
  serviceConfig.onDone(() => {
    registerCommandHandlers(serviceConfig);
  });
}
