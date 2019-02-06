import { ClassOf } from "@axonish/core";
import { forceConvert } from "../util/force-convert";
import { IEvent } from "../interfaces/IEvent";

export type ReactorFunction<TState> = (
  state: TState,
  event: IEvent
) => Promise<void> | void;

export type ReactorHandlerType = {
  [key: string]: ReactorFunction<unknown>;
};

export type EventReactorMetadata = {
  handlerFunction: ReactorFunction<unknown>;
  eventReactorClass: ClassOf<ReactorHandlerType>;
};

export type EventReactorMetadataDictionary = {
  [eventType: string]: EventReactorMetadata[];
};
const eventReactorHandlers: EventReactorMetadataDictionary = {};
export function addEventReactorEventHandler(
  eventType: string,
  handlerFunction: ReactorFunction<unknown>,
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

export function getAllEventReactorEventHandlers(): EventReactorMetadataDictionary {
  return { ...eventReactorHandlers };
}
