import { ClassOf } from "@axonish/core";
import { DomainEvent } from "../common/domain-event";
import { forceConvert } from "../util/force-convert";

export type ReactorFunction = (
  event: DomainEvent<any>
) => Promise<void | {}> | void;

export type ReactorHandlerType = {
  [key: string]: ReactorFunction;
};

export type EventReactorMetadata = {
  handlerFunction: ReactorFunction;
  eventReactorClass: ClassOf<ReactorHandlerType>;
};

export type EventReactorMetadataDictionary = {
  [eventType: string]: EventReactorMetadata[];
};
const eventReactorHandlers: EventReactorMetadataDictionary = {};
export function addEventReactorEventHandler(
  eventType: string,
  handlerFunction: ReactorFunction,
  eventReactorClass: unknown
) {
  if (eventReactorClass) {
    if (!Array.isArray(eventReactorHandlers[eventType])) {
      eventReactorHandlers[eventType] = [];
    }
    eventReactorHandlers[eventType].push({
      handlerFunction,
      eventReactorClass: forceConvert<ClassOf<ReactorHandlerType>>(
        eventReactorClass
      )
    });
  }
}
export function clearEventReactorEventHandlers() {
  for (const key in eventReactorHandlers) {
    delete eventReactorHandlers[key];
  }
}

export function getEventReactorEventHandlers(
  eventType: string
): EventReactorMetadata[] | undefined {
  return eventReactorHandlers[eventType];
}
