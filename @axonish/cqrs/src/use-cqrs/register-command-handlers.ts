import { IServiceConfiguration, MessageResponderToken } from "@axonish/core";
import { CommandExecutor } from "../command-executor";
import { IRepository } from "../interfaces/IRepository";
import { Command } from "../common/command";
import { Repository } from "../repository";
import { EventStoreToken, RepositoryToken } from "../tokens";
import { getAllAggregateRootCommandHandlers } from "../handles-command/metadata";

export function registerCommandHandlers(serviceConfig: IServiceConfiguration) {
  const responder = serviceConfig.services.get(MessageResponderToken);
  if (responder) {
    const commandHandlerMetadata = getAllAggregateRootCommandHandlers();
    for (const commandType in commandHandlerMetadata) {
      responder.on<unknown, unknown>(commandType, async (command: unknown) => {
        const repo = getRepository(serviceConfig);
        // Todo: commandexecutor implementation must be replaceable, with user-defined one.
        const executor = new CommandExecutor<unknown, unknown>(
          repo,
          serviceConfig
        );
        const promises: Promise<any>[] = [];
        for (const handlermeta of commandHandlerMetadata[commandType]) {
          promises.push(
            executor.execute(
              handlermeta.aggregrateRootClass,
              command as Command<unknown, unknown>
            )
          );
        }

        const result = (await Promise.all(promises)).flat();
        return result;
      });
    }
  }
}
function getRepository(serviceConfig: IServiceConfiguration) {
  const token = RepositoryToken;
  const eventStoreToken = EventStoreToken;
  return (
    (serviceConfig.services.has(token) &&
      serviceConfig.services.get<IRepository>(token)) ||
    new Repository(serviceConfig.services.get(eventStoreToken), serviceConfig)
  );
}
