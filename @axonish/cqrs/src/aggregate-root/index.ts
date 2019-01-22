import {
  ClassOf,
  IServiceConfiguration,
  MessagePublisherToken,
  Message
} from "@axonish/core";
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
import { forceConvert } from "../util/force-convert";
import { AxonishContext } from "../axonish-context";

function AggregateRootClassDecorator<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  const aggregateTypeName = constructor.name;
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
    serviceConfig: IServiceConfiguration | null = null;
    aggregateId: AggregateId;
    _state?: { [key: string]: unknown };
    getState<T>(): T {
      return this._state as T;
    }
    setState<T>(state: T): void {
      this._state = { ...this._state, ...state };
    }
    committedEvents: (DomainEvent<unknown> | Snap<unknown>)[] = [];
    uncommittedEvents: (DomainEvent<unknown> | Snap<unknown>)[] = [];
    lastEventIndex?: number;
    load(eventHistory: Array<DomainEvent<unknown> | Snap<unknown>>): void {
      if (this.serviceConfig == null) {
        throw new Error("Service Configuration must be assigned, for loading");
      }
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
      if (this.serviceConfig == null) {
        throw new Error(
          "Service Configuration must be assigned, for comitting"
        );
      }
      if (
        this.serviceConfig &&
        this.uncommittedEvents &&
        this.uncommittedEvents.length > 0
      ) {
        const services = this.serviceConfig.services;
        await executeProjections(
          this.uncommittedEvents,
          this.getState(),
          this.serviceConfig
        );
        if (services.has(MessagePublisherToken)) {
          const publisher = services.get(MessagePublisherToken);
          try {
            this.uncommittedEvents.forEach(event => {
              const eventData = event.toEventData();
              const { getState } = event.ctx!;
              forceConvert<{ state: unknown }>(eventData).state = getState();
              publisher.publish(
                forceConvert<Message<unknown, unknown>>(eventData)
              );
            });
          } catch (e) {
            console.log(e);
          }
        }

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
        const snap = new Snap<TEventPayload>(
          this.getState<TEventPayload>(),
          this.aggregateId
        );
        snap.ctx = new AxonishContext(this);
      }
      return null;
    }
    get aggregateTypeName() {
      return aggregateTypeName;
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
  Object.defineProperty(aggregateRootType, "name", {
    value: aggregateTypeName
  });

  return aggregateRootType;
}
export function AggregateRoot() {
  return AggregateRootClassDecorator;
}

async function executeProjections(
  events: DomainEvent<unknown>[],
  state: unknown,
  serviceConfig: IServiceConfiguration
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
            const projectionInstance: ProjectionHandlerType = serviceConfig.services.get(
              cur.projectionClass
            );
            prev.push({ projectionInstance, handlerFunction });
            return prev;
          },
          []
        );
        type ProjectionDescriptor = {
          projectionInstance: ProjectionHandlerType;
          handlerFunction: ProjectionFunction;
        };
        const applyHandlerFn = (x: ProjectionDescriptor) =>
          x.handlerFunction.apply(x.projectionInstance, [event]);
        const isPromise = (x: any) => x && x.then;
        const promises = handlers.map(applyHandlerFn).filter(isPromise);
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
  const container = serviceConfig.services;
  const aggregateRoot = container.get(AggregateType);
  aggregateRoot.serviceConfig = serviceConfig;
  aggregateRoot.aggregateId = aggregateId;
  const state = (aggregateRoot as any)._state || {};
  (aggregateRoot as any)._state = state;
  container.remove(AggregateType);
  return aggregateRoot;
}
