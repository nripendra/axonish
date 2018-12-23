import { TestFixture, Test, Expect } from "alsatian";
import { HandlesQuery } from ".";

import { clearQueryHandlersForTest, getAllQueryHandlers } from "./metadata";
import { Message } from "@axonish/core";

@TestFixture("@HandlesQuery decorator")
export class HandlesQueryDecoratorSpecs {
  @Test()
  addsDataToMetadata() {
    clearQueryHandlersForTest();
    class TestSubject {
      @HandlesQuery(MyQuery())
      myQueryHandler() {}
    }
    const handlers = getAllQueryHandlers();
    const keys = Object.keys(handlers);
    Expect(keys.length).toBe(1);
    Expect(keys[0]).toBe(MyQuery.name);
    Expect(handlers[MyQuery.name]).toBe(TestSubject.prototype.myQueryHandler);
  }

  @Test()
  takesOnlyOneQueryHandlerPerQueryType() {
    clearQueryHandlersForTest();
    class TestSubject {
      @HandlesQuery(MyQuery())
      myQueryHandler() {}

      @HandlesQuery(MyQuery())
      myQueryHandler2() {}
    }

    class TestSubject2 {
      @HandlesQuery(MyQuery())
      myQueryHandler() {}

      @HandlesQuery(MyQuery())
      myQueryHandler2() {}
    }

    const handlers = getAllQueryHandlers();
    const keys = Object.keys(handlers);
    Expect(keys.length).toBe(1);
    Expect(keys[0]).toBe(MyQuery.name);
    Expect(handlers[MyQuery.name]).toBe(TestSubject2.prototype.myQueryHandler2);
  }

  @Test()
  doesNothingOnNullPrototype() {
    clearQueryHandlersForTest();
    HandlesQuery(MyQuery())(null, "", {});
    const handlers = getAllQueryHandlers();
    const keys = Object.keys(handlers);
    Expect(keys.length).toBe(0);
  }

  @Test()
  doesNothingOnEmptyPropertyKey() {
    clearQueryHandlersForTest();
    class TestSubject {}
    HandlesQuery(MyQuery())(TestSubject.prototype, "", {});

    const handlers = getAllQueryHandlers();
    const keys = Object.keys(handlers);
    Expect(keys.length).toBe(0);
  }

  @Test()
  doesNothingOnNonExistingPropertyKey() {
    clearQueryHandlersForTest();
    class TestSubject {}
    HandlesQuery(MyQuery())(TestSubject.prototype, "foobar", {});
    const handlers = getAllQueryHandlers();
    const keys = Object.keys(handlers);
    Expect(keys.length).toBe(0);
  }

  @Test()
  doesNothingOnNonFunction() {
    class TestSubject {
      foobar = 10;
    }
    HandlesQuery(MyQuery())(TestSubject.prototype, "foobar", {});
    const handlers = getAllQueryHandlers();
    const keys = Object.keys(handlers);
    Expect(keys.length).toBe(0);
  }
}

type Payload = {
  value: number;
};
type ResponsePayload = {
  value: number;
};

type MyQueryType = Message<Payload, ResponsePayload>;

function MyQuery(payload?: Payload): MyQueryType {
  return new Message<Payload, ResponsePayload>(MyQuery.name, payload);
}
