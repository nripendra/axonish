import { AsyncTest, TestFixture, Expect } from "alsatian";
import { CommandExecutor } from ".";
import { AggregateId } from "../common/aggregate-id";
import IEvent from "../interfaces/IEvent";
import IEventStore from "../interfaces/IEventStore";
import { Repository } from "../repository";
import { AggregateRoot } from "../aggregate-root";
import { HandlesCommand } from "../handles-command";
import { Command } from "../common/command";
import { HandlesEvent } from "../handles-event";
import { DomainEvent } from "../common/domain-event";
import { clearAggregateRootEventHandler } from "../handles-event/metadata";
import { clearAggregateRootCommandHandler } from "../handles-command/metadata";
import { IEventStoreItem } from "../interfaces/IEventStoreItem";
import { EventDescriptor } from "../common/event-descriptor";

@TestFixture()
export class CommandExecutorSpecs {
  // @FocusTest
  @AsyncTest(
    `Calling execute method will find the aggregate root, call handler function on that 
    AggregateRoot, and save new events back to the repository`
  )
  async executeFlow() {
    clearAggregateRootEventHandler();
    clearAggregateRootCommandHandler();
    //
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;
      @HandlesCommand(MyCommand())
      myCommand(cmd: Command<MyEventPayload, {}>) {
        const { apply } = cmd.ctx!;
        apply(MyEvent(cmd.payload));
      }

      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const events: IEvent[] = [
      {
        aggregateId: "1",
        id: 0,
        index: 0,
        payload: { value: 1 },
        previousEventIndex: 0,
        type: "MyEvent"
      } as IEvent
    ];

    const fakeEventStore: any = ({
      getEventsByLatestSnapShot(aggregateIds: AggregateId[]) {
        return events.map(x => {
          x.aggregateId = aggregateIds[0];
          return x;
        });
      },
      saveEvents(eventDescriptors: IEventStoreItem[]) {
        events.push(...eventDescriptors.flatMap(x => x.events));
      }
    } as any) as IEventStore;

    const repository = new Repository(fakeEventStore);
    const commandExecutor = new CommandExecutor<MyEventPayload, {}>(repository);
    await commandExecutor.execute(
      MyAggregateRoot,
      MyCommand("1", { value: 10 })
    );
    Expect(events.length).toBe(2);
    Expect((events[1].payload as any).value).toBe(10);
  }

  @AsyncTest(`Execute method checks for aggregateId`)
  async executeCallChecksForAggregateId() {
    clearAggregateRootEventHandler();
    clearAggregateRootCommandHandler();
    //
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;
      @HandlesCommand(MyCommand())
      myCommand(cmd: Command<MyEventPayload, {}>) {
        const { apply } = cmd.ctx!;
        apply(MyEvent(cmd.payload));
      }

      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const events: IEvent[] = [
      {
        aggregateId: "1",
        id: 0,
        index: 0,
        payload: { value: 1 },
        previousEventIndex: 0,
        type: "MyEvent"
      } as IEvent
    ];

    const fakeEventStore: any = ({
      getEventsByLatestSnapShot(aggregateIds: AggregateId[]) {
        return events.map(x => {
          x.aggregateId = aggregateIds[0];
          return x;
        });
      },
      saveEvents(eventDescriptors: IEventStoreItem[]) {
        events.push(...eventDescriptors.flatMap(x => x.events));
      }
    } as any) as IEventStore;

    const repository = new Repository(fakeEventStore);
    const commandExecutor = new CommandExecutor<MyEventPayload, {}>(repository);
    await commandExecutor.execute(
      MyAggregateRoot,
      MyCommand(undefined, { value: 10 })
    );
    Expect(events.length).toBe(1);
  }

  @AsyncTest(`Execute method creates new Aggregate root if not already exists`)
  async executeCanCreateNewAggregateRoot() {
    clearAggregateRootEventHandler();
    clearAggregateRootCommandHandler();
    //
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;
      @HandlesCommand(MyCommand())
      myCommand(cmd: Command<MyEventPayload, {}>) {
        const { apply } = cmd.ctx!;
        apply(MyEvent(cmd.payload));
      }

      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEventType) {
        this.state = event.payload.value;
      }
    }

    const events: IEvent[] = [
      {
        aggregateId: "1",
        id: 0,
        index: 0,
        payload: { value: 1 },
        previousEventIndex: 0,
        type: "MyEvent"
      } as IEvent
    ];

    const fakeEventStore: any = ({
      getEventsByLatestSnapShot(aggregateIds: AggregateId[]) {
        return events.map(x => {
          x.aggregateId = aggregateIds[0];
          return x;
        });
      },
      saveEvents(eventDescriptors: IEventStoreItem[]) {
        events.push(...eventDescriptors.flatMap(x => x.events));
      }
    } as any) as IEventStore;

    const repository = new Repository(fakeEventStore);
    const commandExecutor = new CommandExecutor<MyEventPayload, {}>(repository);
    await commandExecutor.execute(
      MyAggregateRoot,
      MyCommand("2", { value: 10 })
    );
    Expect(events.length).toBe(2);
    Expect(events[1].aggregateId).toBe("2");
    Expect((events[1].payload as any).value).toBe(10);
  }
}

interface MyEventPayload {
  value: number;
}

type MyEventType = DomainEvent<MyEventPayload>;
type MyCommand = Command<MyEventPayload, {}>;

function MyCommand(
  aggregateId?: AggregateId,
  payload?: MyEventPayload
): MyCommand {
  return new Command<MyEventPayload, {}>(
    "MyCommand",
    payload || { value: 0 },
    aggregateId || ""
  );
}

function MyEvent(payload?: MyEventPayload) {
  const descriptor = { payload } as EventDescriptor<MyEventPayload>;

  const e = new DomainEvent<MyEventPayload>(
    "MyEvent",
    descriptor.payload,
    descriptor.aggregateType,
    descriptor.aggregateId
  );
  return e;
}
