import { TestFixture, Expect, Test } from "alsatian";
import { HandlesEvent } from ".";
import { DomainEvent } from "../common/domain-event";
import { AggregateRoot } from "../aggregate-root";
import {
  clearAggregateRootEventHandler,
  getAggregateRootEventHandlers
} from "./metadata";

@TestFixture("@HandlesEvent decorator")
export class HandlesEventDecoratorSpecs {
  @Test()
  addsDataToPrototype() {
    class TestSubject {
      @HandlesEvent(MyEvent())
      myeventHandler() {}
    }
    Expect((TestSubject.prototype as any).__handlesEvent).toBeDefined();
    Expect(
      (TestSubject.prototype as any).__handlesEvent["MyEvent"]
    ).toBeDefined();
    Expect((TestSubject.prototype as any).__handlesEvent["MyEvent"]).toBe(
      TestSubject.prototype.myeventHandler
    );
  }

  @Test()
  takesOnlyOneEventHandlerPerClass() {
    class TestSubject {
      @HandlesEvent(MyEvent())
      myeventHandler() {}

      @HandlesEvent(MyEvent())
      myeventHandler2() {}
    }
    Expect((TestSubject.prototype as any).__handlesEvent).toBeDefined();
    Expect(
      (TestSubject.prototype as any).__handlesEvent["MyEvent"]
    ).toBeDefined();
    Expect((TestSubject.prototype as any).__handlesEvent["MyEvent"]).toBe(
      TestSubject.prototype.myeventHandler2
    );
  }

  @Test()
  doesNothingOnNullPrototype() {
    HandlesEvent(MyEvent())(null, "", {});
  }

  @Test()
  doesNothingOnEmptyPropertyKey() {
    class TestSubject {}
    HandlesEvent(MyEvent())(TestSubject.prototype, "", {});
    Expect((TestSubject.prototype as any).__handlesEvent).not.toBeDefined();
  }

  @Test()
  doesNothingOnNonExistingPropertyKey() {
    class TestSubject {}
    HandlesEvent(MyEvent())(TestSubject.prototype, "foobar", {});
    Expect((TestSubject.prototype as any).__handlesEvent).not.toBeDefined();
  }

  @Test()
  doesNothingOnNonFunction() {
    class TestSubject {
      foobar = 10;
    }
    HandlesEvent(MyEvent())(TestSubject.prototype, "foobar", {});
    Expect((TestSubject.prototype as any).__handlesEvent).not.toBeDefined();
  }

  @Test()
  withAggregateRoot() {
    clearAggregateRootEventHandler();
    @AggregateRoot()
    class TestSubject {
      @HandlesEvent(MyEvent())
      myeventHandler() {}
    }
    @AggregateRoot()
    class TestSubject2 {
      @HandlesEvent(MyEvent())
      myeventHandler() {}
    }
    // AggregateRoot decorator removes __handlesEvent
    Expect((TestSubject.prototype as any).__handlesEvent).not.toBeDefined();
    // AggregateRoot adds the values of __handlesEvent to metadata dictionary
    const eventHandlers = getAggregateRootEventHandlers("MyEvent");
    Expect(eventHandlers.length).toBe(2);
    Expect(eventHandlers[0].handlerFunction).toBe(
      TestSubject.prototype.myeventHandler
    );
    Expect(eventHandlers[0].aggregrateRootClass).toBeDefined();
    Expect(eventHandlers[0].aggregrateRootClass).toBe(TestSubject);

    Expect((TestSubject2.prototype as any).__handlesEvent).not.toBeDefined();
    Expect(eventHandlers[1].handlerFunction).toBe(
      TestSubject2.prototype.myeventHandler
    );
    Expect(eventHandlers[1].aggregrateRootClass).toBeDefined();
    Expect(eventHandlers[1].aggregrateRootClass).toBe(TestSubject2);
  }
}

type MyPayload = { value: number };
type MyEvent = DomainEvent<MyPayload>;
type EventDescriptor<TPayload> = {
  payload: MyPayload;
  aggregateType: string;
  aggregateId: string;
};
function MyEvent(descriptor?: EventDescriptor<MyPayload>): MyEvent {
  descriptor = descriptor || ({} as any);
  return new DomainEvent<MyPayload>(
    "MyEvent",
    descriptor!.payload,
    descriptor!.aggregateType,
    descriptor!.aggregateId
  );
}
