import IApiStartup from "../interfaces/IApiStartup";
import { ApiConfig } from "./api-config";
import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import * as express from "express";
import {
  typeDefs as exampleTypeDefs,
  resolvers as exampleResolvers
} from "./default-types";

type ClassOf<T> = {
  new (...args: any[]): T;
};
type AxonishApiReturnType = (constructor: ClassOf<IApiStartup>) => void;
export type AxonishApolloServer = ApolloServer & { express: express.Express };

/**
 * HACK!! Just for awaiting in Unit tests.
 */
let _initilizingApiPromise: Promise<void> = Promise.resolve();
export async function __AxonishApiAwaitForUnitTest() {
  await _initilizingApiPromise;
}

export function AxonishApi(): AxonishApiReturnType {
  return (constructor: ClassOf<IApiStartup>) => {
    const ApiStartupClass = constructor;
    const instance = new ApiStartupClass();
    _initilizingApiPromise = (async () => {
      const config = new ApiConfig();
      const configResult = instance.config(config);
      if (configResult && configResult.then) {
        await configResult;
      }
      const server = new ApolloServer({
        schema: makeExecutableSchema({
          typeDefs: exampleTypeDefs,
          resolvers: exampleResolvers
        })
      });
      const app = express();
      (server as AxonishApolloServer).express = app;

      const apolloServer: AxonishApolloServer = server as AxonishApolloServer;
      apolloServer.applyMiddleware({ app, path: "/graphql" });
      const oldStop = apolloServer.stop;

      const startingResult = instance.starting(apolloServer);
      if (startingResult && startingResult.then) {
        await startingResult;
      }

      const { port } = config;

      await new Promise(function(resolve) {
        const expressServer = app.listen({ port }, () => {
          apolloServer.stop = () => {
            return new Promise(async function(resolve) {
              await oldStop.apply(apolloServer);
              expressServer.close(resolve);
            });
          };
          resolve();
        });
      });

      const startedResult = instance.started(apolloServer, {
        address: "localhost",
        port
      });
      if (startedResult && startedResult.then) {
        await startedResult;
      }
    })();
  };
}
