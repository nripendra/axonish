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
        const handlers = getAggregateRootCommandHandlers(command.type);

        const ctx = getAxonishContext(aggregateRoot, this.serviceConfig);
        command.ctx = ctx;
        const promises: Promise<void>[] = [];
        for (const handler of handlers) {
          // Todo: pipeline functionality.
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
        let saved: boolean = false;
        try {
          await this.repository.save([aggregateRoot]);
          saved = true;
        } catch (e) {
          aggregateRoot.uncommit();
          throw e;
        } finally {
          if (saved) {
            await aggregateRoot.commit();
          }
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
