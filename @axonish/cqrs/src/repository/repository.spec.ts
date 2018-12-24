import { TestFixture, AsyncTest, Expect, FocusTest } from "alsatian";
import { Repository } from ".";
import IEventStore from "../interfaces/IEventStore";
import { AggregateRoot } from "../aggregate-root";
import { HandlesEvent } from "../handles-event";
import { DomainEvent } from "../common/domain-event";
import { AggregateId } from "../common/aggregate-id";
import IEvent from "../interfaces/IEvent";
import { Command } from "../common/command";
import { HandlesCommand } from "../handles-command";
import { AxonishContext } from "../axonish-context";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { clearAggregateRootEventHandler } from "../handles-event/metadata";
import { EventDescriptor } from "../common/event-descriptor";
import IEventStoreItem from "../interfaces/IEventStoreItem";
import { ServiceConfig } from "@axonish/core";

@TestFixture("Repository")
export class RespositorySpecs {
  // @FocusTest
  @AsyncTest("Repository loads event from eventstore")
  async loadEvents() {
    clearAggregateRootEventHandler();
    //
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;
      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const fakeEventStore: any = ({
      getEventsByLatestSnapShot(aggregateIds: AggregateId[]) {
        return [
          {
            aggregateId: aggregateIds[0],
            id: 0,
            index: 0,
            payload: { value: 5 },
            previousEventIndex: 0,
            type: "MyEvent"
          } as IEvent
        ];
      }
    } as any) as IEventStore;

    const repository = new Repository(fakeEventStore, new ServiceConfig());
    const ar = await repository.find(MyAggregateRoot, "1");
    Expect(ar).not.toBeNull();
    Expect(((ar as unknown) as IAggregateRoot).aggregateId).toBe("1");
    Expect(ar!.state).toBe(5);
  }

  @AsyncTest("Repository returns null when empty events from eventstore")
  async returnsNullOnEmptyEvents() {
    clearAggregateRootEventHandler();
    //
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;
      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const fakeEventStore: any = ({
      getEventsByLatestSnapShot(aggregateIds: AggregateId[]) {
        return [];
      }
    } as any) as IEventStore;

    const repository = new Repository(fakeEventStore, new ServiceConfig());
    const ar = await repository.find(MyAggregateRoot, "1");
    Expect(ar).toBeNull();
  }

  // @FocusTest
  @AsyncTest("Repository saves to eventstore")
  async saveEvents() {
    clearAggregateRootEventHandler();
    //
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;
      @HandlesCommand(MyCommand())
      myCommand(cmd: Command<{}, {}>) {
        const { apply } = cmd.ctx!;
        apply(MyEvent({ value: 2 }));
      }

      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const events: IEvent[] = [];

    const fakeEventStore: any = ({
      saveEvents(eventDescriptors: IEventStoreItem[]) {
        events.push(...eventDescriptors.flatMap(x => x.events));
      }
    } as any) as IEventStore;

    const ar = new MyAggregateRoot();
    ((ar as unknown) as IAggregateRoot).aggregateId = "1";
    const cmd = MyCommand();
    cmd.ctx = new AxonishContext(ar);
    ar.myCommand(cmd);
    const repository = new Repository(fakeEventStore, new ServiceConfig());
    await repository.save([ar]);

    Expect(events).not.toBeEmpty();
    Expect(events[0].aggregateId).toBe("1");
    Expect((events[0].payload as MyEventPayload).value).toBe(2);
  }
}

interface MyEventPayload {
  value: number;
}

type MyEventType = DomainEvent<MyEventPayload>;
type MyCommand = Command<{}, {}>;

function MyCommand(aggregateId?: AggregateId) {
  return new Command<{}, {}>("MyCommand", {}, aggregateId || "");
}

function MyEvent(payload?: MyEventPayload) {
  const descriptor = { payload } as EventDescriptor<MyEventPayload>;
  const e = new DomainEvent<MyEventPayload>(
    "MyEvent",
    descriptor.payload,
    descriptor.aggregateId
  );
  return e;
}
