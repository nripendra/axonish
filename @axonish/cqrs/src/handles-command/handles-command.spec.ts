import { TestFixture, Test, Expect, FocusTests } from "alsatian";
import { HandlesCommandPrototype, HandlesCommand } from ".";
import { Command } from "../common/command";
import { AggregateId } from "../common/aggregate-id";
import { forceConvert } from "../util/force-convert";
import { AggregateRoot } from "../aggregate-root";
import {
  clearAggregateRootCommandHandler,
  getAggregateRootCommandHandlers
} from "./metadata";
import { CommandDescriptor } from "../common/command-descriptor";

@TestFixture("@HandlesCommand decorator")
export class HandlesCommandDecoratorSpecs {
  @Test()
  addsDataToPrototype() {
    class TestSubject {
      @HandlesCommand(MyCommand())
      mycommandHandler() {}
    }
    const prototype = forceConvert<HandlesCommandPrototype>(
      TestSubject.prototype
    );
    Expect(prototype.__handlesCommand).toBeDefined();
    Expect(prototype.__handlesCommand!["MyCommand"]).toBeDefined();
    Expect(prototype.__handlesCommand!["MyCommand"]).toBe(
      TestSubject.prototype.mycommandHandler
    );
  }

  @Test()
  takesOnlyOneCommandHandlerPerClass() {
    class TestSubject {
      @HandlesCommand(MyCommand())
      myCommandHandler() {}

      @HandlesCommand(MyCommand())
      myCommandHandler2() {}
    }
    const prototype = forceConvert<HandlesCommandPrototype>(
      TestSubject.prototype
    );
    Expect(prototype.__handlesCommand).toBeDefined();
    Expect(prototype.__handlesCommand!["MyCommand"]).toBeDefined();
    Expect(prototype.__handlesCommand!["MyCommand"]).toBe(
      TestSubject.prototype.myCommandHandler2
    );
  }

  @Test()
  doesNothingOnNullPrototype() {
    HandlesCommand(MyCommand())(null, "", {});
  }

  @Test()
  doesNothingOnEmptyPropertyKey() {
    class TestSubject {}
    HandlesCommand(MyCommand())(TestSubject.prototype, "", {});
    const prototype = forceConvert<HandlesCommandPrototype>(
      TestSubject.prototype
    );
    Expect(prototype.__handlesCommand).not.toBeDefined();
  }

  @Test()
  doesNothingOnNonExistingPropertyKey() {
    class TestSubject {}
    HandlesCommand(MyCommand())(TestSubject.prototype, "foobar", {});
    const prototype = forceConvert<HandlesCommandPrototype>(
      TestSubject.prototype
    );
    Expect(prototype.__handlesCommand).not.toBeDefined();
  }

  @Test()
  doesNothingOnNonFunction() {
    class TestSubject {
      foobar = 10;
    }
    HandlesCommand(MyCommand())(TestSubject.prototype, "foobar", {});
    const prototype = forceConvert<HandlesCommandPrototype>(
      TestSubject.prototype
    );
    Expect(prototype.__handlesCommand).not.toBeDefined();
  }

  @Test()
  withAggregateRoot() {
    clearAggregateRootCommandHandler();
    @AggregateRoot()
    class TestSubject {
      @HandlesCommand(MyCommand())
      myCommandHandler() {}
    }
    @AggregateRoot()
    class TestSubject2 {
      @HandlesCommand(MyCommand())
      myCommandHandler() {}
    }
    const prototype = forceConvert<HandlesCommandPrototype>(
      TestSubject.prototype
    );
    // AggregateRoot decorator removes __handlesCommand
    Expect(prototype.__handlesCommand).not.toBeDefined();
    // AggregateRoot adds the values of __handlesCommand to metadata dictionary
    const commandHandlers = getAggregateRootCommandHandlers("MyCommand");
    Expect(commandHandlers.length).toBe(2);
    Expect(commandHandlers[0].handlerFunction).toBe(
      TestSubject.prototype.myCommandHandler
    );
    Expect(commandHandlers[0].aggregrateRootClass).toBeDefined();
    Expect(commandHandlers[0].aggregrateRootClass).toBe(TestSubject);

    Expect(prototype.__handlesCommand).not.toBeDefined();
    Expect(commandHandlers[1].handlerFunction).toBe(
      TestSubject2.prototype.myCommandHandler
    );
    Expect(commandHandlers[1].aggregrateRootClass).toBeDefined();
    Expect(commandHandlers[1].aggregrateRootClass).toBe(TestSubject2);
  }
}

type Payload = {
  value: number;
};
type ResponsePayload = {
  value: number;
};

type MyCommand = Command<Payload, ResponsePayload>;

function MyCommand(payload?: Payload): MyCommand {
  const descriptor = { payload } as CommandDescriptor<Payload>;
  return new Command<Payload, ResponsePayload>(
    MyCommand.name,
    descriptor.payload,
    descriptor.aggregateId
  );
}
