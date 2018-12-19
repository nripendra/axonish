import { ClassOf } from "@axonish/core";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { DomainEvent } from "../common/domain-event";
import { Snap } from "../common/snap";
import IEvent from "../interfaces/IEvent";
import { EventHandlerFunction } from "../common/event-handler-function";
import { isNullOrUndefined } from "util";
import {
  getProjectionHandlers,
  ProjectionHandlerType,
  ProjectionFunction
} from "../projection-handler/metadata";
import { Container } from "typedi";

function AggregateRootClassDecorator<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  return class extends constructor implements IAggregateRoot {
    constructor(...args: any[]) {
      super(...args);
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

    aggregateId?: string | undefined;
    _state?: { [key: string]: unknown };
    getState<T>(): T {
      return this._state as T;
    }
    committedEvents: (DomainEvent<unknown> | Snap<unknown>)[] = [];
    uncommittedEvents: (DomainEvent<unknown> | Snap<unknown>)[] = [];
    lastEventIndex?: number;
    load(eventHistory: IEvent[]): void {
      throw new Error("Method not implemented.");
    }
    applyEvent<TEventPayload>(
      event: DomainEvent<TEventPayload> | Snap<TEventPayload>,
      handler: EventHandlerFunction<TEventPayload>,
      isUncommittedEvent: boolean
    ): void {
      if (!isNullOrUndefined(event) && !isNullOrUndefined(handler)) {
        const isHistoricalEvent: boolean = isUncommittedEvent === false;
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
