import { ClassOf, IServiceConfiguration } from "@axonish/core";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { DomainEvent } from "../common/domain-event";
import { Snap } from "../common/snap";
import IEvent from "../interfaces/IEvent";
import { isNullOrUndefined } from "util";
import {
  getProjectionHandlers,
  ProjectionHandlerType,
  ProjectionFunction
} from "../projection-handler/metadata";
import { Container } from "typedi";
import {
  addAggregateRootEventHandler,
  AggregateRootEventHandlerMetadata,
  getAggregateRootEventHandlers
} from "../handles-event/metadata";
import {
  AggregateRootEventHandlerDictionary,
  AggregateRootEventHandlerFunction,
  AggregateRootCommandHandlerDictionary
} from "../common/aggregate-root-metadata-types";
import { addAggregateRootCommandHandler } from "../handles-command/metadata";
import { AggregateId } from "../common/aggregate-id";

function AggregateRootClassDecorator<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  const aggregateRootType = class extends constructor
    implements IAggregateRoot {
    constructor(...args: any[]) {
      super(...args);
      // @ts-ignore: this.aggregateId will be assigned if not assigned
      if (isNullOrUndefined(this.aggregateId)) {
        this.aggregateId = "";
      }
      if (isNullOrUndefined(this.uncommittedEvents)) {
        this.uncommittedEvents = [];
      }
      if (isNullOrUndefined(this.lastEventIndex)) {
        this.lastEventIndex = 0;
      }
      if (isNullOrUndefined(this._state)) {
        this._state = {};
      }
    }

    aggregateId: string;
    _state?: { [key: string]: unknown };
    getState<T>(): T {
      return this._state as T;
    }
    setState<T>(state: T): void {
      this._state = state;
    }
    committedEvents: (DomainEvent<unknown> | Snap<unknown>)[] = [];
    uncommittedEvents: (DomainEvent<unknown> | Snap<unknown>)[] = [];
    lastEventIndex?: number;
    load(eventHistory: Array<DomainEvent<unknown> | Snap<unknown>>): void {
      this._state = {};
      if (eventHistory) {
        for (let i = 0; i < eventHistory.length; i++) {
          const event = eventHistory[i];
          if (event.type && event.payload) {
            const handlers = getAggregateRootEventHandlers(event.type);
            const handlerFunction = (
              event: DomainEvent<unknown>,
              isHistoricalEvent: boolean
            ) => {
              for (let j = 0; j < handlers.length; j++) {
                if (this instanceof handlers[j].aggregrateRootClass) {
                  handlers[j].handlerFunction.apply(this, [
                    event,
                    isHistoricalEvent
                  ]);
                }
              }
            };
            this.dispatchEvent(event, handlerFunction, false);
          }
        }
      }
    }
    dispatchEvent<TEventPayload>(
      event: DomainEvent<TEventPayload> | Snap<TEventPayload>,
      handler: AggregateRootEventHandlerFunction<TEventPayload>,
      isUncommittedEvent: boolean
    ): void {
      if (!isNullOrUndefined(event) && !isNullOrUndefined(handler)) {
        if (!event.ctx) {
          throw new Error("Context must be set before dispatching");
        }
        const isHistoricalEvent: boolean = isUncommittedEvent === false;
        event.aggregateType = constructor.name;
        event.aggregateId = this.aggregateId;
        handler.apply(this, [event, isHistoricalEvent]);

        if (isUncommittedEvent) {
          this.uncommittedEvents.push(event);
        } else {
          this.lastEventIndex = event.index;
          this.committedEvents.push(event);
        }
      }
    }
    async commit(): Promise<void> {
      if (this.uncommittedEvents && this.uncommittedEvents.length > 0) {
        await executeProjections(this.uncommittedEvents, this.getState());

        // Todo: Publish to event bus.

        this.committedEvents.push(...this.uncommittedEvents);
        this.uncommittedEvents.length = 0;
      }
    }
    uncommit(): void {
      this.uncommittedEvents.length = 0;
    }
    applySnapShot<TEventPayload>(
      snapShot: Snap<TEventPayload>,
      isHistoricalSnapShot: boolean
    ): void {
      if (!isNullOrUndefined(snapShot)) {
        this._state = snapShot.payload;
      }
      if (isHistoricalSnapShot === false) {
        if (this.uncommittedEvents.indexOf(snapShot) === -1) {
          this.uncommittedEvents.push(snapShot);
        }
      }
    }
    createSnap<TEventPayload>(): Snap<TEventPayload> | null {
      if (this.aggregateId) {
        return new Snap<TEventPayload>(
          this.getState<TEventPayload>(),
          constructor.name,
          this.aggregateId
        );
      }
      return null;
    }
  };
  if (constructor.prototype.__handlesEvent) {
    const __handlesEvent: AggregateRootEventHandlerDictionary =
      constructor.prototype.__handlesEvent;
    for (const key in __handlesEvent) {
      const handler = __handlesEvent[key];
      addAggregateRootEventHandler(key, handler, aggregateRootType);
    }
    delete constructor.prototype.__handlesEvent;
  }
  if (constructor.prototype.__handlesCommand) {
    const __handlesCommand: AggregateRootCommandHandlerDictionary =
      constructor.prototype.__handlesCommand;
    for (const key in __handlesCommand) {
      const handler = __handlesCommand[key];
      addAggregateRootCommandHandler(key, handler, aggregateRootType);
    }
    delete constructor.prototype.__handlesCommand;
  }
  Object.defineProperty(aggregateRootType, "name", { value: constructor.name });

  return aggregateRootType;
}
export function AggregateRoot() {
  return AggregateRootClassDecorator;
}

async function executeProjections(
  events?: DomainEvent<unknown>[],
  state?: unknown
) {
  if (events) {
    for (const event of events) {
      const handlerMetadata = getProjectionHandlers(event.type);
      if (handlerMetadata) {
        const handlers = handlerMetadata.reduce(
          (
            prev: {
              projectionInstance: ProjectionHandlerType;
              handlerFunction: ProjectionFunction;
            }[],
            cur
          ) => {
            const handlerFunction = cur.handlerFunction;
            const projectionInstance: ProjectionHandlerType = Container.get(
              cur.projectionClass
            );
            prev.push({ projectionInstance, handlerFunction });
            return prev;
          },
          []
        );
        const promises = handlers
          .map(x =>
            x.handlerFunction.apply(x.projectionInstance, [state, event])
          )
          .filter(x => x && x.then);
        await Promise.all(promises);
      }
    }
  }
}
// executeProjections

export function createNewAggregateRoot<T extends IAggregateRoot>(
  AggregateType: ClassOf<T>,
  aggregateId: AggregateId,
  serviceConfig: IServiceConfiguration
) {
  const aggregateRoot = serviceConfig.services.get(AggregateType);
  aggregateRoot.aggregateId = aggregateId;
  return aggregateRoot;
}
