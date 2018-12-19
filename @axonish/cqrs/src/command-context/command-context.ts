import { DomainEvent } from "../common/domain-event";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { getAggregateRootEventHandlers } from "../handles-event/metadata";
import { forceConvert } from "../util/force-convert";

export class CommandContext {
  correlationId: string = "";

  constructor(public aggregateRoot: unknown) {
    this.apply = this.apply.bind(this);
    this.getState = this.getState.bind(this) as any;
  }

  apply<T>(event?: DomainEvent<T>, isUncomittedEvent: boolean = true) {
    if (event && this.aggregateRoot) {
      const eventHandlerMetadata = getAggregateRootEventHandlers(event.type);
      eventHandlerMetadata.forEach(metadata =>
        forceConvert<IAggregateRoot>(this.aggregateRoot).applyEvent(
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
