import { TestFixture, Test, Expect, SpyOn, AsyncTest } from "alsatian";
import { AggregateRoot } from ".";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { DomainEvent } from "../common/domain-event";
import { ClassOf } from "@axonish/core";
import {
  clearProjectionHandlers,
  addProjectionHandler
} from "../projection-handler/metadata";
import Container, { Token, Inject } from "typedi";
import { AxonishContext } from "../axonish-context";
import { AggregateId } from "../common/aggregate-id";

@TestFixture("@AggregateRoot decorator")
export class AggregateRootDecorator {
  @Test("@AggregateRoot decorator changes class to IAggregateRoot")
  aggregateRootHasState() {
    @AggregateRoot()
    class TestSubject {}
    const ar = createAggregateRoot(TestSubject);
    Expect(ar._state).toBeDefined();
    Expect(ar.getState).toBeDefined();
    Expect(ar.committedEvents).toBeDefined();
    Expect(ar.uncommittedEvents).toBeDefined();
    Expect(ar.lastEventIndex).toBeDefined();
    Expect(ar.load).toBeDefined();
    Expect(ar.dispatchEvent).toBeDefined();
    Expect(ar.commit).toBeDefined();
    Expect(ar.uncommit).toBeDefined();
    Expect(ar.applySnapShot).toBeDefined();
    Expect(ar.createSnap).toBeDefined();
  }

  @Test("Aggregate root constructor initializes the new properties if not set")
  initializesProperties() {
    @AggregateRoot()
    class TestSubject {}
    const ar = createAggregateRoot(TestSubject, null);
    Expect(ar.aggregateId).toBe("");
    Expect(Object.keys(ar._state).length).toBe(0);
    Expect(ar.uncommittedEvents.length).toBe(0);
    Expect(ar.lastEventIndex).toBe(0);
  }

  @Test(
    "Aggregate root constructor doesn't override new properties if already set"
  )
  doNotOverrideSetProperties() {
    @AggregateRoot()
    class TestSubject {
      aggregateId = "1";
      _state = { value: 5 };
      lastEventIndex = 1;
    }
    const ar = createAggregateRoot(TestSubject);
    Expect(ar.aggregateId).toBe("1");
    Expect(Object.keys(ar._state).length).toBe(1);
    Expect(ar.lastEventIndex).toBe(1);
  }
  @Test("@aggregateRoot preserves class name")
  aggregateRootPreservesClassName(): void {
    @AggregateRoot()
    class TestSubject2 {}
    const TestSubject = TestSubject2;

    Expect(TestSubject.name).toBe("TestSubject2");
  }
  @Test(
    "`applyEvent` method adds event to uncommittedEvents if isUncomittedEvent"
  )
  applyEventMethodTracks(): void {
    @AggregateRoot()
    class TestSubject {}
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 0,
        payload: {},
        type: "MyEvent",
        ctx
      } as DomainEvent<unknown>,
      () => {
        return;
      },
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(1);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 0,
        payload: {},
        type: "MyEvent2",
        ctx
      } as DomainEvent<unknown>,
      () => {
        return;
      },
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(2);
  }
  @Test(
    "`applyEvent` sets lastIndex if historical events, and adds to committed event"
  )
  applyEventMethodTracksIndex(): void {
    @AggregateRoot()
    class TestSubject {}
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyEvent",
        ctx
      } as DomainEvent<unknown>,
      () => {
        return;
      },
      false
    );
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEvent2",
        ctx
      } as DomainEvent<unknown>,
      () => {
        return;
      },
      false
    );
    Expect(ar.uncommittedEvents.length).toBe(0);
    Expect(ar.committedEvents.length).toBe(2);
    Expect(ar.lastEventIndex).toBe(2);
  }
  @Test("`applyEvent` applies the handler function")
  applyEventAppliesHandlerFunction(): void {
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    SpyOn(ar, "onMyEvent");
    SpyOn(ar, "onMyEvent2");
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyEvent",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent,
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(1);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEvent2",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent2,
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(2);
    Expect(ar.onMyEvent)
      .toHaveBeenCalled()
      .exactly(1).times;
    Expect(ar.onMyEvent2)
      .toHaveBeenCalled()
      .exactly(1).times;
  }
  @Test("`applyEvent` method doesn't support null or undefined event")
  applyEventMethodDoesntSupportNullOrUndefinedEvent(): void {
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    SpyOn(ar, "onMyEvent");
    SpyOn(ar, "onMyEvent2");
    ar.dispatchEvent(null as any, ar.onMyEvent, true);
    Expect(ar.uncommittedEvents!.length).toBe(0);
    ar.dispatchEvent(undefined as any, ar.onMyEvent2, true);
    Expect(ar.uncommittedEvents.length).toBe(0);
    Expect(ar.onMyEvent).not.toHaveBeenCalled();
    Expect(ar.onMyEvent2).not.toHaveBeenCalled();
  }
  @Test("`applyEvent` method doesn't support null or undefined handler")
  applyEventMethodDoesntSupportNullOrUndefinedHandler(): void {
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    SpyOn(ar, "onMyEvent");
    SpyOn(ar, "onMyEvent2");
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEvent2",
        ctx
      } as DomainEvent<unknown>,
      null as any,
      true
    );
    Expect(ar.uncommittedEvents!.length).toBe(0);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEvent2",
        ctx
      } as DomainEvent<unknown>,
      undefined as any,
      true
    );
    Expect(ar.uncommittedEvents!.length).toBe(0);
    Expect(ar.onMyEvent).not.toHaveBeenCalled();
    Expect(ar.onMyEvent2).not.toHaveBeenCalled();
  }
  @Test("`applyEvent` applies the handler function on historical events")
  applyEventAppliesHandlerFunctionOnHistoricalEvents(): void {
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    SpyOn(ar, "onMyEvent");
    SpyOn(ar, "onMyEvent2");
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyEvent",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent,
      false
    );
    Expect(ar.uncommittedEvents.length).toBe(0);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEvent2",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent2,
      false
    );
    Expect(ar.uncommittedEvents.length).toBe(0);
    Expect(ar.committedEvents.length).toBe(2);
    Expect(ar.onMyEvent)
      .toHaveBeenCalled()
      .exactly(1).times;
    Expect(ar.onMyEvent2)
      .toHaveBeenCalled()
      .exactly(1).times;
  }
  @AsyncTest("`commit` will reset uncommitted events")
  async commitWillReset() {
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyEvent",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent,
      true
    );
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEvent2",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent2,
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(2);
    await ar.commit();
    Expect(ar.uncommittedEvents.length).toBe(0);
  }
  @AsyncTest("`commit` will run projections")
  async commitWillRunProjections() {
    clearProjectionHandlers();
    addProjectionHandler(
      "MyEvent",
      ProjectionHandler.prototype.onMyEvent,
      ProjectionHandler
    );
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyEvent",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent,
      true
    );
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEvent2",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent2,
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(2);
    await ar.commit();
    Expect(ProjectionHandler.callCount).toBe(1);
    Expect(ar.uncommittedEvents.length).toBe(0);
  }
  @AsyncTest("`commit` will await projections")
  async commitWillWaitProjections() {
    clearProjectionHandlers();
    addProjectionHandler(
      "MyAsyncEvent",
      AsyncProjectionHandler.prototype.onMyAsyncEvent,
      AsyncProjectionHandler
    );
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyAsyncEvent",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent,
      true
    );
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyAsyncEvent2",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent2,
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(2);
    await ar.commit();
    Expect(AsyncProjectionHandler.callCount).toBe(1);
    Expect(ar.uncommittedEvents.length).toBe(0);
  }
  @AsyncTest("`commit` will create single projections instance")
  async commitWillApplyProjectionOnSameInstance() {
    clearProjectionHandlers();
    addProjectionHandler(
      "MyEventProjectionInstance",
      AsyncProjectionHandler2.prototype.onMyAsyncEvent,
      AsyncProjectionHandler2
    );
    addProjectionHandler(
      "MyEventProjectionInstance2",
      AsyncProjectionHandler2.prototype.onMyAsyncEvent,
      AsyncProjectionHandler2
    );
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyEventProjectionInstance",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent,
      true
    );
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEventProjectionInstance2",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent2,
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(2);
    await ar.commit();
    Expect(Container.get(AsyncProjectionHandler2).callCount).toBe(2);
    Expect(ar.uncommittedEvents.length).toBe(0);
  }
  @AsyncTest("`commit` inject dependencies into projections instance")
  async commitWillInject() {
    clearProjectionHandlers();
    addProjectionHandler(
      "MyEventProjectionInstance",
      AsyncProjectionHandler3.prototype.onMyAsyncEvent,
      AsyncProjectionHandler3
    );
    addProjectionHandler(
      "MyEventProjectionInstance2",
      AsyncProjectionHandler3.prototype.onMyAsyncEvent,
      AsyncProjectionHandler3
    );
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyEventProjectionInstance",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent,
      true
    );
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEventProjectionInstance2",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent2,
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(2);
    await ar.commit();
    Expect(Container.get(AsyncProjectionHandler3).test!.callCount).toBe(2);
    Expect(ar.uncommittedEvents.length).toBe(0);
  }
  @Test("`uncommit` will clear uncommitted events")
  uncommit() {
    @AggregateRoot()
    class TestSubject {
      onMyEvent() {}
      onMyEvent2() {}
    }
    const ar = createAggregateRoot(TestSubject);
    const ctx = new AxonishContext(ar);
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 1,
        payload: {},
        type: "MyEventProjectionInstance",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent,
      true
    );
    ar.dispatchEvent(
      {
        aggregateId: "1",
        index: 2,
        payload: {},
        type: "MyEventProjectionInstance2",
        ctx
      } as DomainEvent<unknown>,
      ar.onMyEvent2,
      true
    );
    Expect(ar.uncommittedEvents.length).toBe(2);
    ar.uncommit();
    Expect(ar.uncommittedEvents.length).toBe(0);
  }
}

class ProjectionHandler {
  static callCount: number;
  constructor() {
    ProjectionHandler.callCount = 0;
  }
  async onMyEvent<TState, TEventPayload>(
    state: TState,
    event: DomainEvent<TEventPayload>
  ) {
    ProjectionHandler.callCount++;
  }
}

class AsyncProjectionHandler {
  static callCount: number;
  constructor() {
    AsyncProjectionHandler.callCount = 0;
  }
  onMyAsyncEvent(state: unknown, event: DomainEvent<unknown>) {
    return new Promise(function(resolve) {
      setTimeout(() => {
        AsyncProjectionHandler.callCount++;
        resolve();
      }, 100);
    });
  }
}

class AsyncProjectionHandler2 {
  constructor() {
    this.callCount = 0;
  }
  callCount: number;
  onMyAsyncEvent(state: unknown, event: DomainEvent<{}>) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.callCount++;
        resolve();
      }, 100);
    });
  }
}

export class CounterService {
  callCount: number = 0;
  reset() {
    this.callCount = 0;
  }
}
const t = new Token<CounterService>();
Container.set(t, new CounterService());
class AsyncProjectionHandler3 {
  constructor(@Inject(t) public test?: CounterService) {
    this.test && this.test.reset();
  }
  onMyAsyncEvent(state: unknown, event: DomainEvent<{}>) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.test!.callCount++;
        resolve();
      }, 100);
    });
  }
}

type HasState = { _state: { [key: string]: unknown } };
function createAggregateRoot<T>(
  Type: ClassOf<T>,
  aggregateId: AggregateId | null = "1"
): IAggregateRoot & T & HasState {
  const ar: any = new Type();
  if (aggregateId !== null) {
    ar.aggregateId = aggregateId;
  }
  return ar as IAggregateRoot & T & HasState;
}
