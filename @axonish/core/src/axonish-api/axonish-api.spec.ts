import { TestFixture, Test, Expect, AsyncTest } from "alsatian";
import {
  AxonishApi,
  __AxonishApiAwaitForUnitTest,
  AxonishApolloServer
} from ".";
import IApiStartup, { ServerStartedInfo } from "../interfaces/IApiStartup";
import IApiConfiguration from "../interfaces/IApiConfiguration";
import { ApolloServer } from "apollo-server-express";
import { gqlFetch } from "../test-utils/gql-fetch";
import { Books } from "./default-types";
@TestFixture()
export class AxonishApiSpecs {
  @AsyncTest(`Call lifecycle functions in following order:
    1. 'config'
    2. 'starting'
    3. 'started'`)
  async lifeCycleFunctions() {
    const calledFunctions: string[] = [];
    @AxonishApi()
    class TestApi implements IApiStartup {
      config(appConfig: IApiConfiguration): void | Promise<any> {
        calledFunctions.push("config");
      }
      starting(graphqlServer: ApolloServer): void | Promise<void> {
        calledFunctions.push("starting");
      }
      async started(graphqlServer: ApolloServer, info: ServerStartedInfo) {
        calledFunctions.push("started");
        await graphqlServer.stop();
      }
      onError(err: any): void {}
    }
    await __AxonishApiAwaitForUnitTest();
    Expect(calledFunctions[0]).toBe("config");
    Expect(calledFunctions[1]).toBe("starting");
    Expect(calledFunctions[2]).toBe("started");
  }

  @AsyncTest(`Support promises in lifecycle functions`)
  async supportPromise() {
    const calledFunctions: string[] = [];
    @AxonishApi()
    class TestApi implements IApiStartup {
      async config(appConfig: IApiConfiguration): Promise<any> {
        await Promise.resolve();
        calledFunctions.push("config");
      }
      async starting(graphqlServer: ApolloServer): Promise<void> {
        await Promise.resolve();
        calledFunctions.push("starting");
      }
      async started(graphqlServer: ApolloServer, info: ServerStartedInfo) {
        await Promise.resolve();
        calledFunctions.push("started");
        await graphqlServer.stop();
      }
      onError(err: any): void {}
    }
    await __AxonishApiAwaitForUnitTest();
    Expect(calledFunctions[0]).toBe("config");
    Expect(calledFunctions[1]).toBe("starting");
    Expect(calledFunctions[2]).toBe("started");
  }

  @AsyncTest(`config function receives an instance of IApiConfiguration`)
  async apiConfig() {
    let config: unknown = null;
    function isApiConfig(arg: any) {
      return (arg as IApiConfiguration).setPort !== undefined;
    }
    @AxonishApi()
    class TestApi implements IApiStartup {
      async config(apiConfig: IApiConfiguration): Promise<any> {
        await Promise.resolve();
        config = apiConfig;
      }
      async starting(graphqlServer: ApolloServer): Promise<void> {
        await Promise.resolve();
      }
      async started(graphqlServer: ApolloServer, info: ServerStartedInfo) {
        await Promise.resolve();
        await graphqlServer.stop();
      }
      onError(err: any): void {}
    }
    await __AxonishApiAwaitForUnitTest();
    Expect(isApiConfig(config)).toBe(true);
  }

  @AsyncTest(`starting function receives an instance of ApolloServer`)
  async apolloServer() {
    let server: unknown = null;
    function isApiConfig(arg: any): arg is IApiConfiguration {
      return (arg as IApiConfiguration).setPort !== undefined;
    }
    @AxonishApi()
    class TestApi implements IApiStartup {
      async config(apiConfig: IApiConfiguration): Promise<any> {
        await Promise.resolve();
      }
      async starting(graphqlServer: AxonishApolloServer): Promise<void> {
        await Promise.resolve();
        server = graphqlServer;
      }
      async started(
        graphqlServer: AxonishApolloServer,
        info: ServerStartedInfo
      ) {
        await Promise.resolve();
        await graphqlServer.stop();
      }
      onError(err: any): void {}
    }
    await __AxonishApiAwaitForUnitTest();
    Expect(server instanceof ApolloServer).toBe(true);
    Expect((server as AxonishApolloServer).express).toBeDefined();
  }

  @AsyncTest(`started function gets called after server is started`)
  async startedMethod() {
    let server: unknown = null;
    let serverStartedInfo: ServerStartedInfo | null = null;
    function isApiConfig(arg: any): arg is IApiConfiguration {
      return (arg as IApiConfiguration).setPort !== undefined;
    }
    @AxonishApi()
    class TestApi implements IApiStartup {
      async config(apiConfig: IApiConfiguration): Promise<any> {
        await Promise.resolve();
      }
      async starting(graphqlServer: AxonishApolloServer): Promise<void> {
        await Promise.resolve();
      }
      async started(
        graphqlServer: AxonishApolloServer,
        info: ServerStartedInfo
      ) {
        await Promise.resolve();
        server = graphqlServer;
        serverStartedInfo = info;
      }
      onError(err: any): void {}
    }
    await __AxonishApiAwaitForUnitTest();
    Expect(server instanceof ApolloServer).toBe(true);
    Expect((server as AxonishApolloServer).express).toBeDefined();
    Expect(serverStartedInfo).not.toBeNull();
    const response = await gqlFetch<Books>(
      (serverStartedInfo! as ServerStartedInfo).port as number,
      `{
      books {
        title,
        author
      }
    }`
    );
    await (server as AxonishApolloServer).stop();
    Expect(response.books.length).toBe(2);
    Expect(response.books[0].title).toBe(
      "Harry Potter and the Chamber of Secrets"
    );
    Expect(response.books[0].author).toBe("J.K. Rowling");
  }
}
