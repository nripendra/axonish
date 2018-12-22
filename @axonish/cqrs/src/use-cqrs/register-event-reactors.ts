import {
  IServiceConfiguration,
  MessageSubscriberToken,
  Message
} from "@axonish/core";
import { getAllEventReactorEventHandlers } from "../event-reactor/metadata";
import { DomainEvent } from "../common/domain-event";
import { forceConvert } from "../util/force-convert";
import IEvent from "../interfaces/IEvent";

type HasState = { state: unknown };
type MessageWithState = Message<IEvent, void> & HasState;

export function registerEventReactors(serviceConfig: IServiceConfiguration) {
  const responder = serviceConfig.services.get(MessageSubscriberToken);
  if (responder) {
    const eventReactorMetadata = getAllEventReactorEventHandlers();
    for (const eventType in eventReactorMetadata) {
      responder.on<IEvent>(
        eventType,
        async (message: Message<IEvent, void>) => {
          for (const handlermeta of eventReactorMetadata[eventType]) {
            const eventReactorInstance = serviceConfig.services.get(
              handlermeta.eventReactorClass
            );

            if (message.payload) {
              const messageWithState = forceConvert<MessageWithState>(message);
              const state = messageWithState.state;
              delete messageWithState.state;
              const event = forceConvert<IEvent>(message);
              handlermeta.handlerFunction.apply(eventReactorInstance, [
                state,
                event
              ]);
            }
          }
        }
      );
    }
  }
}
