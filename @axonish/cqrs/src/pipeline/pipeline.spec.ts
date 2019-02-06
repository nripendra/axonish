import { TestFixture, Test, Expect, AsyncTest, FocusTests } from "alsatian";
import { Pipeline } from ".";
import { CommandDescriptor } from "../common/command-descriptor";
import { Command } from "../common/command";
import { ICommandPipeline } from "../interfaces/ICommandPipeline";
import { IAggregateRoot } from "../interfaces/IAggregateRoot";
import { getPipelines, clearPipelinesForTest } from "./metadata";
import { PipelineLifeCycleStage } from "./pipeline-executor";
import { CommandExecutor } from "../command-executor";
import { IRepository } from "../interfaces/IRepository";
import { ServiceConfig } from "@axonish/core";
import { AggregateRoot } from "../aggregate-root";
import { forceConvert } from "../util/force-convert";
import { AggregateId } from "../common/aggregate-id";
import { HandlesCommand } from "../handles-command";

@TestFixture()
export class PipelineSpecs {
  @Test()
  addsToMetadata() {
    clearPipelinesForTest();
    @Pipeline(MyCommand())
    class TestSubject implements ICommandPipeline<Payload, {}> {
      before(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
      after(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
      committing(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
      committed(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
      finally(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
      error<T extends Error>(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>,
        error: T
      ): void | Promise<void> {}
    }
    const pipelines = getPipelines(MyCommand().type);
    Expect(pipelines.length).toBe(1);
    Expect(pipelines[0].prototype).toBe(TestSubject.prototype);
  }

  @AsyncTest()
  async commandExecutorIntegration() {
    const lifeCycleEvents: (PipelineLifeCycleStage | "executed")[] = [];
    clearPipelinesForTest();
    @Pipeline(MyCommand())
    class TestSubject implements ICommandPipeline<Payload, {}> {
      before(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {
        lifeCycleEvents.push("before");
      }
      after(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {
        lifeCycleEvents.push("after");
      }
      committing(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {
        lifeCycleEvents.push("committing");
      }
      committed(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {
        lifeCycleEvents.push("committed");
      }
      finally(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {
        lifeCycleEvents.push("finally");
      }
      error<T extends Error>(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>,
        error: T
      ): void | Promise<void> {
        lifeCycleEvents.push("error");
      }
    }

    @AggregateRoot()
    class Ar {
      @HandlesCommand(MyCommand())
      myCommandHandler(command: MyCommand) {
        lifeCycleEvents.push("executed");
      }
    }

    const repo = {
      async find<TAggregate>(
        aggregateType: new (...args: unknown[]) => TAggregate,
        aggregateId: AggregateId
      ) {
        const ar = forceConvert<IAggregateRoot>(new Ar());
        ar.aggregateId = aggregateId;
        return ar;
      },
      async save(aggregates: unknown[]) {}
    } as IRepository;

    const executor = new CommandExecutor<Payload, {}>(
      repo,
      new ServiceConfig()
    );
    await executor.execute(Ar, MyCommand("1", { value: 2 }));
    Expect(lifeCycleEvents[0]).toBe("before");
    Expect(lifeCycleEvents[1]).toBe("executed");
    Expect(lifeCycleEvents[2]).toBe("after");
    Expect(lifeCycleEvents[3]).toBe("committing");
    Expect(lifeCycleEvents[4]).toBe("committed");
    Expect(lifeCycleEvents[5]).toBe("finally");
  }
}

type Payload = {
  value: number;
};

type MyCommand = Command<Payload, {}>;
function MyCommand(aggregateId?: AggregateId, payload?: Payload): MyCommand {
  const type = MyCommand.name;
  const descriptor = { aggregateId, payload } as CommandDescriptor<Payload>;
  return new Command<Payload, {}>(
    type,
    descriptor.payload,
    descriptor.aggregateId
  );
}
