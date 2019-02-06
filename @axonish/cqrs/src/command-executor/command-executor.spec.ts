import { AsyncTest, TestFixture, Expect } from "alsatian";
import { CommandExecutor } from ".";
import { AggregateId } from "../common/aggregate-id";
import { IEvent } from "../interfaces/IEvent";
import { IEventStore } from "../interfaces/IEventStore";
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
import { ServiceConfig } from "@axonish/core";
import { CommandResponse } from "../common/command-response";

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

    const config = new ServiceConfig();
    const repository = new Repository(fakeEventStore, config);
    const commandExecutor = new CommandExecutor<MyEventPayload, {}>(
      repository,
      config
    );
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

    const config = new ServiceConfig();
    const repository = new Repository(fakeEventStore, config);
    const commandExecutor = new CommandExecutor<MyEventPayload, {}>(
      repository,
      config
    );
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

    const config = new ServiceConfig();
    const repository = new Repository(fakeEventStore, config);
    const commandExecutor = new CommandExecutor<MyEventPayload, {}>(
      repository,
      config
    );
    await commandExecutor.execute(
      MyAggregateRoot,
      MyCommand("2", { value: 10 })
    );
    Expect(events.length).toBe(2);
    Expect(events[1].aggregateId).toBe("2");
    Expect((events[1].payload as any).value).toBe(10);
  }

  @AsyncTest(`Returns result`)
  async returnsResult() {
    clearAggregateRootEventHandler();
    clearAggregateRootCommandHandler();
    //
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;
      @HandlesCommand(MyCommand())
      myCommand(cmd: Command<MyEventPayload, string>) {
        const { apply } = cmd.ctx!;
        apply(MyEvent(cmd.payload));
        return "hello";
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

    const config = new ServiceConfig();
    const repository = new Repository(fakeEventStore, config);
    const commandExecutor = new CommandExecutor<MyEventPayload, string>(
      repository,
      config
    );
    const result:
      | CommandResponse<string>[]
      | undefined = await commandExecutor.execute(
      MyAggregateRoot,
      MyCommand("2", { value: 10 })
    );
    Expect(result![0].payload).toBe("hello");
  }

  @AsyncTest(`Returns failure result`)
  async returnsFailureResult() {
    clearAggregateRootEventHandler();
    clearAggregateRootCommandHandler();
    //
    @AggregateRoot()
    class MyAggregateRoot {
      state = 0;
      @HandlesCommand(MyCommand())
      myCommand(cmd: Command<MyEventPayload, string>) {
        const { apply } = cmd.ctx!;
        apply(MyEvent(cmd.payload));
        throw new Error("Hello");
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

    const config = new ServiceConfig();
    const repository = new Repository(fakeEventStore, config);
    const commandExecutor = new CommandExecutor<MyEventPayload, string>(
      repository,
      config
    );
    const result:
      | CommandResponse<string>[]
      | undefined = await commandExecutor.execute(
      MyAggregateRoot,
      MyCommand("2", { value: 10 })
    );
    Expect(result![0].success).toBe(false);
    Expect(result![0].payload).toBe(undefined);
    Expect(result![0].errors![0].message).toBe("Hello");
  }
}

interface MyEventPayload {
  value: number;
}

type MyEventType = DomainEvent<MyEventPayload>;
type MyCommand = Command<MyEventPayload, string>;

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
    descriptor.aggregateId
  );
  return e;
}
