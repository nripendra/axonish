import { Command } from "../common/command";
import IRepository from "../interfaces/IRepository";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { promises } from "fs";
import Container from "typedi";
import { AggregateId } from "../common/aggregate-id";
import {
  AxonishContext,
  getAxonishContext,
  disposeContext
} from "../axonish-context";
import { getAggregateRootCommandHandlers } from "../handles-command/metadata";
import { IServiceConfiguration, ServiceConfig, ClassOf } from "@axonish/core";
import { createNewAggregateRoot } from "../aggregate-root";
import { getPipelines } from "../pipeline/metadata";
import {
  executePipeline,
  PipelineLifeCycleStage
} from "../pipeline/pipeline-executor";

export class CommandExecutor<TPayload, TResponsePayload> {
  constructor(
    private repository: IRepository,
    private serviceConfig: IServiceConfiguration
  ) {}

  async execute(
    AggregateType: ClassOf<any>,
    command: Command<TPayload, TResponsePayload>
  ) {
    if (command.aggregateId) {
      const aggregateRoot = await this.getAggregateRoot(
        AggregateType,
        command.aggregateId,
        this.repository,
        this.serviceConfig
      );

      if (aggregateRoot) {
        if (!aggregateRoot.serviceConfig) {
          aggregateRoot.serviceConfig = this.serviceConfig;
        }
        const handlers = getAggregateRootCommandHandlers(command.type);

        const ctx = getAxonishContext(aggregateRoot, this.serviceConfig);
        command.ctx = ctx;
        const promises: Promise<void>[] = [];
        const pipelines = getPipelines(command.type).map(pipelineType => {
          return this.serviceConfig.services.get(pipelineType);
        });
        const executeLifeCycleStage = (
          stage: PipelineLifeCycleStage,
          error?: Error
        ) => executePipeline(pipelines, stage, aggregateRoot, command);
        let saved: boolean = false;
        try {
          await executeLifeCycleStage("before");
          for (const handler of handlers) {
            const response = handler.handlerFunction.apply(aggregateRoot, [
              command
            ]);
            if (response && response.then) {
              promises.push(response);
            }
          }
          if (promises.length > 0) {
            await Promise.all(promises);
          }
          await executeLifeCycleStage("after");
          await executeLifeCycleStage("committing");
          await this.repository.save([aggregateRoot]);
          saved = true;
        } catch (e) {
          aggregateRoot.uncommit();
          saved = false;
          await executeLifeCycleStage("error", e);
        } finally {
          if (saved) {
            await aggregateRoot.commit();
            await executeLifeCycleStage("committed");
          }
          await executeLifeCycleStage("finally");
          disposeContext(aggregateRoot, this.serviceConfig);
        }
      }
    }
  }

  async getAggregateRoot<T extends IAggregateRoot>(
    AggregateType: ClassOf<T>,
    aggregateId: AggregateId,
    repository: IRepository,
    serviceConfig: IServiceConfiguration
  ): Promise<IAggregateRoot> {
    const aggregateRootInstance =
      (await repository.find(AggregateType, aggregateId)) ||
      createNewAggregateRoot(AggregateType, aggregateId, serviceConfig);
    return aggregateRootInstance;
  }
}
