import {
  IServiceConfiguration,
  MessageSubscriberToken,
  Message
} from "@axonish/core";
import { getAllEventReactorEventHandlers } from "../event-reactor/metadata";
import { DomainEvent } from "../common/domain-event";
import { forceConvert } from "../util/force-convert";
import { getAxonishContext } from "../axonish-context";

export function registerEventReactors(serviceConfig: IServiceConfiguration) {
  const responder = serviceConfig.services.get(MessageSubscriberToken);
  if (responder) {
    const eventReactorMetadata = getAllEventReactorEventHandlers();
    for (const eventType in eventReactorMetadata) {
      responder.on<unknown>(
        eventType,
        async (event: Message<unknown, void>) => {
          for (const handlermeta of eventReactorMetadata[eventType]) {
            const eventReactorInstance = serviceConfig.services.get(
              handlermeta.eventReactorClass
            );
            // TODO:
            // If we need access to aggregateRoot then, We need to
            // re-fetch aggregateRoot, and recreate the context object.
            // Specially if we want capability to run event-reactors as
            // a separate process. This is going to have performance
            // implications. In case of running in same process, we can
            // have work-around. Let's wait till implementing a more
            // realistic example, and see how likely is it that we'd need
            // to access the aggregate root.
            const domainEvent = forceConvert<DomainEvent<unknown>>(event);
            handlermeta.handlerFunction.apply(eventReactorInstance, [
              domainEvent
            ]);
          }
        }
      );
    }
  }
}
