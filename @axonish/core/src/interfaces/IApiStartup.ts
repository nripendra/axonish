import { IApiConfiguration } from "./IApiConfiguration";
import { AxonishApolloServer } from "../axonish-api";

export type ServerStartedInfo = { address: string; port: string | number };

export interface IApiStartup {
  config(apiConfig: IApiConfiguration): void | Promise<void>;

  starting(graphqlServer: AxonishApolloServer): void | Promise<void>;

  started(
    graphqlServer: AxonishApolloServer,
    info: ServerStartedInfo
  ): void | Promise<void>;

  onError(err: any): void;
}
