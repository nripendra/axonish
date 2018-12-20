import { DomainEvent } from "../common/domain-event";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { getAggregateRootEventHandlers } from "../handles-event/metadata";
import { forceConvert } from "../util/force-convert";
import { IServiceConfiguration } from "@axonish/core";

export class AxonishContext {
  correlationId: string = "";

  constructor(public aggregateRoot: unknown) {
    this.apply = this.apply.bind(this);
    this.getState = this.getState.bind(this) as any;
  }

  apply<T>(event?: DomainEvent<T>, isUncomittedEvent: boolean = true) {
    if (event && this.aggregateRoot) {
      event.ctx = this;
      const eventHandlerMetadata = getAggregateRootEventHandlers(event.type);
      eventHandlerMetadata.forEach(metadata =>
        forceConvert<IAggregateRoot>(this.aggregateRoot).dispatchEvent(
          event,
          metadata.handlerFunction,
          isUncomittedEvent
        )
      );
    }
  }

  getState<T>() {
    if (this.aggregateRoot) {
      return forceConvert<IAggregateRoot>(this.aggregateRoot).getState<T>();
    }
    return null;
  }

  setState<T>(state: T) {
    if (this.aggregateRoot) {
      return forceConvert<IAggregateRoot>(this.aggregateRoot).setState(state);
    }
  }
}

const getContextId = (aggregateRootInstance: IAggregateRoot) =>
  aggregateRootInstance.aggregateId + "_context";

export function getAxonishContext(
  aggregateRootInstance: IAggregateRoot,
  serviceConfig: IServiceConfiguration
) {
  if (!aggregateRootInstance.aggregateId) {
    throw new Error("Context not available without aggregateId");
  }
  const contextId = getContextId(aggregateRootInstance);
  if (serviceConfig.services.has(contextId)) {
    return serviceConfig.services.get<AxonishContext>(contextId);
  }
  const ctx = new AxonishContext(aggregateRootInstance);
  serviceConfig.services.set({
    id: contextId,
    type: AxonishContext,
    value: ctx
  });
  return ctx;
}

export function disposeContext(
  aggregateRootInstance: IAggregateRoot,
  serviceConfig: IServiceConfiguration
) {
  if (aggregateRootInstance.aggregateId) {
    const contextId = getContextId(aggregateRootInstance);
    if (serviceConfig.services.has(contextId)) {
      serviceConfig.services.remove(contextId);
    }
  }
}
