import { TestFixture, Test, Expect } from "alsatian";
import { AxonishApi } from ".";
import IApiStartup, { ServerStartedInfo } from "../interfaces/IApiStartup";
import IApiConfiguration from "../interfaces/IApiConfiguration";
import { ApolloServer } from "apollo-server-express";
@TestFixture()
export class AxonishApiSpecs {
  @Test(`Call lifecycle functions in following order:
    1. 'config'
    2. 'starting'
    3. 'started'`)
  lifeCycleFunctions() {
    const calledFunctions: string[] = [];
    @AxonishApi()
    class TestApi implements IApiStartup {
      config(appConfig: IApiConfiguration): void | Promise<any> {
        calledFunctions.push("config");
      }
      starting(graphqlServer: ApolloServer): void | Promise<void> {
        calledFunctions.push("starting");
      }
      started(graphqlServer: ApolloServer, info: ServerStartedInfo) {
        calledFunctions.push("started");
      }
      onError(err: any): void {}
    }
    Expect(calledFunctions[0]).toBe("config");
    Expect(calledFunctions[1]).toBe("starting");
    Expect(calledFunctions[2]).toBe("started");
  }
}
