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
import { CommandResponse } from "../common/command-response";
import { forceConvert } from "../util/force-convert";

export class CommandExecutor<TPayload, TResponsePayload> {
  constructor(
    private repository: IRepository,
    private serviceConfig: IServiceConfiguration
  ) {}

  async execute(
    AggregateType: ClassOf<any>,
    command: Command<TPayload, TResponsePayload>
  ): Promise<CommandResponse<TResponsePayload>[]> {
    const result: CommandResponse<TResponsePayload>[] = [];
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
        const promises: Promise<CommandResponse<TResponsePayload>>[] = [];
        const pipelines = getPipelines(command.type).map(pipelineType => {
          return this.serviceConfig.services.get(pipelineType);
        });
        const executeLifeCycleStage = (
          stage: PipelineLifeCycleStage,
          error?: Error
        ) => executePipeline(pipelines, stage, aggregateRoot, command, error);
        let saved: boolean = false;
        try {
          await executeLifeCycleStage("before");
          for (const handler of handlers) {
            let response = handler.handlerFunction.apply(aggregateRoot, [
              command
            ]);
            if (response) {
              if (!(response.then instanceof Function)) {
                response = Promise.resolve(response);
              }
              promises.push(
                forceConvert<Promise<CommandResponse<TResponsePayload>>>(
                  response
                )
              );
            }
          }
          if (promises.length > 0) {
            result.push(...(await Promise.all(promises)));
          }
          await executeLifeCycleStage("after");
          await executeLifeCycleStage("committing");
          await this.repository.save([aggregateRoot]);
          saved = true;
        } catch (e) {
          aggregateRoot.uncommit();
          saved = false;
          await executeLifeCycleStage("error", e);
          result.push({
            success: false,
            errors: [
              {
                message: e.message,
                stack: e.stack,
                name: e.name,
                ...e
              } as Error
            ]
          });
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
    if (result.length > 0) {
      for (let i = 0; i < result.length; i++) {
        let item = result[i];
        if (
          item === undefined ||
          item.success === undefined ||
          (item.payload !== undefined && item.errors !== undefined)
        ) {
          item = {
            success: true,
            payload: forceConvert<TResponsePayload>(item)
          };
          result[i] = item;
        }
      }
    } else {
      result.push({
        success: true,
        payload: undefined
      });
    }
    return result;
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
