import { Command } from "../common/command";
import IRepository from "../interfaces/IRepository";
import IAggregateRoot from "../interfaces/IAggregateRoot";
import { promises } from "fs";
import Container from "typedi";
import { AggregateId } from "../common/aggregate-id";
import { AxonishContext } from "../axonish-context";
import { getAggregateRootCommandHandlers } from "../handles-command/metadata";

export class CommandExecutor<TPayload, TResponsePayload> {
  constructor(public repository: IRepository) {}

  async execute(
    AggregateType: any,
    command: Command<TPayload, TResponsePayload>
  ) {
    if (command.aggregateId) {
      const aggregateRoot = await this.getAggregateRoot(
        AggregateType,
        command.aggregateId
      );

      if (aggregateRoot) {
        const handlers = getAggregateRootCommandHandlers(command.type);
        const ctx = new AxonishContext(aggregateRoot);
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
        }
        if (saved) {
          await aggregateRoot.commit();
        }
      }
    }
  }

  async getAggregateRoot(
    AggregateType: any,
    aggregateId: AggregateId
  ): Promise<IAggregateRoot> {
    return ((await this.repository.find(AggregateType, aggregateId)) ||
      Container.get(AggregateType)) as IAggregateRoot;
  }
}
