import { TestFixture, Test, Expect, FocusTests } from "alsatian";
import { Pipeline } from ".";
import { CommandDescriptor } from "../common/command-descriptor";
import { Command } from "../common/command";
import { ICommandPipeline } from "../interfaces/ICommandPipeline";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { getPipelines, clearPipelinesForTest } from "./metadata";

@FocusTests
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
      comitting(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
      comitted(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
      finally(
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
      error<T extends Error>(
        error: T,
        aggregateRoot: IAggregateRoot,
        command: Command<Payload, {}>
      ): void | Promise<void> {}
    }
    const pipelines = getPipelines(MyCommand().type);
    Expect(pipelines.length).toBe(1);
    Expect(pipelines[0].prototype).toBe(TestSubject.prototype);
  }
}

type Payload = {
  value: number;
};

function MyCommand(payload?: Payload) {
  const type = MyCommand.name;
  const descriptor = { payload } as CommandDescriptor<Payload>;
  return new Command<Payload, {}>(
    type,
    descriptor.payload,
    descriptor.aggregateId
  );
}
