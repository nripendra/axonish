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
      cqrsConfig.parent.services.set(EventStoreToken, fakeEventStore);
      cqrsConfig.parent.services.set(
        MessageResponderToken,
        new MessageResponder("Test-Service")
      );
    });

    serviceConfig.doneCallbacks.forEach(callback => callback());
    const messageBus = new MessageBus();
    await messageBus.channel("Test-Service").send(MyCommand("1"));
    Expect(myCommandCalled).toBe(true);
  }
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
