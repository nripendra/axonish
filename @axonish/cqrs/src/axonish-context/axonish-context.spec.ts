import { TestFixture, Expect, Test } from "alsatian";
import { AggregateRoot } from "../aggregate-root";
import { HandlesEvent } from "../handles-event";
import { Command } from "../common/command";
import { DomainEvent } from "../common/domain-event";
import { AxonishContext } from ".";
import { CommandDescriptor } from "../common/command-descriptor";
import { EventDescriptor } from "../common/event-descriptor";

@TestFixture("CommandContext")
export class CommandContextSpecs {
  @Test("Apply method calls the event handler")
  applyFunction() {
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;

      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const ar = new MyAggregateRoot();
    const ctx = new AxonishContext(ar);
    const { apply } = ctx;
    apply(MyEvent({ value: 5 }));
    Expect(ar.state).toBe(5);
  }

  @Test("Apply checks for null aggregateRoot")
  applyFunctionChecksNullAggregateRoot() {
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;

      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const ar = new MyAggregateRoot();
    const ctx = new AxonishContext(null);
    const { apply } = ctx;
    apply(MyEvent({ value: 5 }));
    Expect(ar.state).toBe(0);
  }

  @Test("Apply checks for null Event")
  applyFunctionChecksNullEvent() {
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;

      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const ar = new MyAggregateRoot();
    const ctx = new AxonishContext(ar);
    const { apply } = ctx;
    apply(null as any);
    Expect(ar.state).toBe(0);
  }
}

interface MyEventPayload {
  value: number;
}

type MyEventType = DomainEvent<MyEventPayload>;
type MyCommand = Command<{}, {}>;

function MyCommand(payload?: {}): MyCommand {
  const param = { payload } as CommandDescriptor<{}>;
  return new Command<{}, {}>(MyCommand.name, param.payload, param.aggregateId);
}

function MyEvent(payload?: MyEventPayload): MyEventType {
  const param = { payload: payload } as EventDescriptor<MyEventPayload>;
  const e = new DomainEvent<MyEventPayload>(
    MyEvent.name,
    param.payload,
    param.aggregateId
  );
  return e;
}
