import ICommandPipeline from "../interfaces/ICommandPipeline";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { Command } from "../common/command";
import { forceConvert } from "../util/force-convert";

export type PipelineLifeCycleStage =
  | "before"
  | "after"
  | "committing"
  | "committed"
  | "error"
  | "finally";
type PipelineLifeCycleFn<P, R> = (
  aggregateRoot: IAggregateRoot,
  command: Command<P, R>,
  error?: Error
) => Promise<void> | void;
export async function executePipeline<P, R>(
  pipelines: ICommandPipeline<P, R>[],
  lifeCycleStage: PipelineLifeCycleStage,
  aggregateRoot: IAggregateRoot,
  command: Command<P, R>,
  error?: Error
) {
  const promiseResults = pipelines.map(async pipeline => {
    if (pipeline[lifeCycleStage] instanceof Function) {
      const pipelineLifeCycleFn = forceConvert<PipelineLifeCycleFn<P, R>>(
        pipeline[lifeCycleStage]
      );
      try {
        const result = pipelineLifeCycleFn.apply(pipeline, [
          aggregateRoot,
          command,
          error
        ]);
        if (result && result.then) {
          await result;
        }
      } catch (e) {
        if (lifeCycleStage !== "error") {
          await executePipeline(pipelines, "error", aggregateRoot, command, e);
        }
      }
    }
  });
  await Promise.all(promiseResults);
}
