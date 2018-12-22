import { TestFixture, Expect, AsyncTest, Timeout } from "alsatian";
import ICqrsConfiguration from "../interfaces/ICqrsConfiguration";
import {
  ServiceConfig,
  MessageResponderToken,
  MessageResponder,
  MessageBus
} from "@axonish/core";
import IEventStore from "../interfaces/IEventStore";
import { AggregateRoot } from "../aggregate-root";
import { HandlesCommand } from "../handles-command";
import { AggregateId } from "../common/aggregate-id";
import { Command } from "../common/command";
import IEvent from "../interfaces/IEvent";
import { EventStoreToken } from "../tokens";
import { IEventStoreItem } from "../interfaces/IEventStoreItem";
import { clearAggregateRootCommandHandler } from "../handles-command/metadata";
import { useCqrs } from "./use-cqrs";
import { Token } from "typedi";
import { clearEventReactorEventHandlers } from "../event-reactor/metadata";
import { EventReactor } from "../event-reactor";
import { DomainEvent } from "../common/domain-event";
import { CommandDescriptor } from "../common/command-descriptor";
import { HandlesEvent } from "../handles-event";
import { EventDescriptor } from "../common/event-descriptor";

@TestFixture()
export class UseCqrsSpecs {
  @AsyncTest()
  async useCqrsGetsCqrsConfiguration() {
    const serviceConfig = new ServiceConfig();
    let cqrsConfiguration: ICqrsConfiguration | null = null;
    await useCqrs(serviceConfig, cqrsConfig => {
      cqrsConfiguration = cqrsConfig;
    });
    Expect(cqrsConfiguration).not.toBeNull();
  }

  @AsyncTest()
  async cqrsConfigsParentIsServiceConfig() {
    const serviceConfig = new ServiceConfig();
    let cqrsConfiguration: ICqrsConfiguration | null = null;
    await useCqrs(serviceConfig, cqrsConfig => {
      cqrsConfiguration = cqrsConfig;
    });
    Expect(cqrsConfiguration).not.toBeNull();
    Expect(cqrsConfiguration!.parent).toBe(serviceConfig);
  }

  @AsyncTest()
  async useCqrsAddsDoneCallback() {
    const serviceConfig = new ServiceConfig();
    await useCqrs(serviceConfig, cqrsConfig => {});
    Expect(serviceConfig.doneCallbacks).not.toBeEmpty();
  }

  @Timeout(2500)
  @AsyncTest()
  async doneCallbackRegistersCommandHandlers() {
    const serviceConfig = new ServiceConfig();
    const events: IEvent[] = [];
    const fakeEventStore: IEventStore = ({
      getEventsByLatestSnapShot(aggregateIds: AggregateId[]) {
        return events;
      },
      saveEvents(eventDescriptors: IEventStoreItem[]) {
        events.push(...eventDescriptors.flatMap(x => x.events));
      }
    } as any) as IEventStore;
    let myCommandCalled = false;
    clearAggregateRootCommandHandler();
    @AggregateRoot()
    class TestAggregateRoot {
      @HandlesCommand(MyCommand())
      myCommand() {
        myCommandCalled = true;
      }
    }

    await useCqrs(serviceConfig, cqrsConfig => {
      cqrsConfig.parent.services.set({
        id: EventStoreToken,
        value: fakeEventStore
      });
      cqrsConfig.parent.services.set({
        id: MessageResponderToken,
        value: new MessageResponder("Test-Service")
      });
    });

    serviceConfig.doneCallbacks.forEach(callback => callback());
    const messageBus = new MessageBus();
    await messageBus.channel("Test-Service").send(MyCommand("1"));
    Expect(myCommandCalled).toBe(true);
  }

  @Timeout(2500)
  @AsyncTest()
  async doneCallbackRegistersEventReactors() {
    let gotState: TestState | null = null;
    let appliedEvent: IEvent | null = null;
    const serviceConfig = new ServiceConfig();
    serviceConfig.setServiceName("Test-Service");
    const events: IEvent[] = [];
    const fakeEventStore: IEventStore = ({
      getEventsByLatestSnapShot(aggregateIds: AggregateId[]) {
        return events;
      },
      saveEvents(eventDescriptors: IEventStoreItem[]) {
        events.push(...eventDescriptors.flatMap(x => x.events));
      }
    } as any) as IEventStore;
    let myCommandCalled = false;
    let reactorCalled = false;
    clearAggregateRootCommandHandler();
    clearEventReactorEventHandlers();
    @AggregateRoot()
    class TestAggregateRoot {
      @HandlesCommand(MyCommand())
      myCommand(command: MyCommandType) {
        myCommandCalled = true;
        const { apply } = command.ctx!;
        apply(MyEvent({ value: 5 }));
      }

      @HandlesEvent(MyEvent())
      onMyEvent(event: MyEvent) {
        const { setState } = event.ctx!;
        setState<TestState>({ value: event.payload.value + 10 });
      }
    }
    let done = () => {};
    const defer = new Promise(resolve => (done = resolve));

    @EventReactor()
    class TestReactor {
      @HandlesEvent(MyEvent())
      myevent(state: TestState, event: IEvent) {
        reactorCalled = true;
        gotState = state;
        appliedEvent = event;
        done();
      }
    }

    await useCqrs(serviceConfig, cqrsConfig => {
      cqrsConfig.parent.services.set({
        id: EventStoreToken,
        value: fakeEventStore
      });
      cqrsConfig.parent.services.set({
        id: MessageResponderToken,
        value: new MessageResponder("Test-Service")
      });
    });

    serviceConfig.doneCallbacks.forEach(callback => callback());
    const messageBus = new MessageBus();
    await messageBus.channel("Test-Service").send(MyCommand("1"));
    Expect(myCommandCalled).toBe(true);
    await defer;
    Expect(reactorCalled).toBe(true);
    Expect(gotState!.value).toBe(15);
    Expect((appliedEvent!.payload as TestState).value).toBe(5);
  }
}

interface TestState {
  value: number;
}
interface MyCommandPayload {
  value: number;
}

type MyCommandType = Command<MyCommandPayload, {}>;

function MyCommand(
  aggregateId?: AggregateId,
  payload?: MyCommandPayload
): MyCommandType {
  return new Command<MyCommandPayload, {}>(
    "MyCommand",
    payload || { value: 0 },
    aggregateId || ""
  ) as MyCommandType;
}

type MyEvent = DomainEvent<MyCommandPayload>;

function MyEvent(payload?: MyCommandPayload): MyEvent {
  const descriptor = {
    type: MyEvent.name,
    payload,
    aggregateId: ""
  } as EventDescriptor<MyCommandPayload>;
  return new DomainEvent<MyCommandPayload>(
    descriptor.type,
    descriptor.payload,
    descriptor.aggregateId
  ) as MyEvent;
}
