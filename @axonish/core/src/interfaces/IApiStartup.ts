import IApiConfiguration from "./IApiConfiguration";
import { ApolloServer } from "apollo-server-express";

export type ServerStartedInfo = { address: string; port: string | number };

export default interface IApiStartup {
  config(appConfig: IApiConfiguration): void | Promise<any>;

  starting(graphqlServer: ApolloServer): void | Promise<void>;

  started(
    graphqlServer: ApolloServer,
    info: ServerStartedInfo
  ): void | Promise<void>;

  onError(err: any): void;
}
