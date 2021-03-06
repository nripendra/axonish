import { TestFixture, Test, Expect, AsyncTest, Timeout } from "alsatian";
import {
  AxonishApi,
  __AxonishApiAwaitForUnitTest,
  AxonishApolloServer
} from ".";
import { IApiStartup, ServerStartedInfo } from "../interfaces/IApiStartup";
import { IApiConfiguration } from "../interfaces/IApiConfiguration";
import { ApolloServer, gql, makeExecutableSchema } from "apollo-server-express";
import { gqlFetch } from "../test-utils/gql-fetch";
import { Books } from "../common/default-types";
import {
  __InjectConventionsForUnitTest,
  __InjectRootDir,
  __ClearVisitedGlobsForUnitTest
} from "./resolver-convention";

__InjectRootDir(__dirname);

@TestFixture()
export class AxonishApiSpecs {
  @AsyncTest(`Call lifecycle functions in following order:
    1. 'config'
    2. 'starting'
    3. 'started'`)
  async lifeCycleFunctions() {
    let server: AxonishApolloServer | null = null;
    try {
      const calledFunctions: string[] = [];
      @AxonishApi()
      class TestApi implements IApiStartup {
        config(appConfig: IApiConfiguration): void | Promise<void> {
          calledFunctions.push("config");
        }
        starting(graphqlServer: ApolloServer): void | Promise<void> {
          calledFunctions.push("starting");
        }
        async started(
          graphqlServer: AxonishApolloServer,
          info: ServerStartedInfo
        ) {
          calledFunctions.push("started");
          server = graphqlServer;
        }
        onError(err: any): void {}
      }
      await __AxonishApiAwaitForUnitTest();
      Expect(calledFunctions[0]).toBe("config");
      Expect(calledFunctions[1]).toBe("starting");
      Expect(calledFunctions[2]).toBe("started");
    } finally {
      await server!.stop();
    }
  }

  @AsyncTest(`Support promises in lifecycle functions`)
  async supportPromise() {
    let server: AxonishApolloServer | null = null;
    try {
      const calledFunctions: string[] = [];
      @AxonishApi()
      class TestApi implements IApiStartup {
        async config(appConfig: IApiConfiguration): Promise<void> {
          await Promise.resolve();
          calledFunctions.push("config");
        }
        async starting(graphqlServer: ApolloServer): Promise<void> {
          await Promise.resolve();
          calledFunctions.push("starting");
        }
        async started(
          graphqlServer: AxonishApolloServer,
          info: ServerStartedInfo
        ) {
          await Promise.resolve();
          calledFunctions.push("started");
          server = graphqlServer;
        }
        onError(err: any): void {}
      }
      await __AxonishApiAwaitForUnitTest();
      Expect(calledFunctions[0]).toBe("config");
      Expect(calledFunctions[1]).toBe("starting");
      Expect(calledFunctions[2]).toBe("started");
    } finally {
      await server!.stop();
    }
  }

  @AsyncTest(`config function receives an instance of IApiConfiguration`)
  async apiConfig() {
    let server: AxonishApolloServer | null = null;
    try {
      let config: unknown = null;
      function isApiConfig(arg: unknown) {
        return (arg as IApiConfiguration).setPort !== undefined;
      }
      @AxonishApi()
      class TestApi implements IApiStartup {
        async config(apiConfig: IApiConfiguration): Promise<void> {
          await Promise.resolve();
          config = apiConfig;
        }
        async starting(graphqlServer: ApolloServer): Promise<void> {
          await Promise.resolve();
        }
        async started(
          graphqlServer: AxonishApolloServer,
          info: ServerStartedInfo
        ) {
          await Promise.resolve();
          server = graphqlServer;
        }
        onError(err: any): void {}
      }
      await __AxonishApiAwaitForUnitTest();
      Expect(isApiConfig(config)).toBe(true);
    } finally {
      await server!.stop();
    }
  }

  @AsyncTest(`starting function receives an instance of ApolloServer`)
  async apolloServer() {
    let server: AxonishApolloServer | null = null;
    try {
      function isApiConfig(arg: unknown): arg is IApiConfiguration {
        return (arg as IApiConfiguration).setPort !== undefined;
      }
      @AxonishApi()
      class TestApi implements IApiStartup {
        async config(apiConfig: IApiConfiguration): Promise<void> {
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
      Expect(server! instanceof ApolloServer).toBe(true);
      Expect((server! as AxonishApolloServer).express).toBeDefined();
    } finally {
      await server!.stop();
    }
  }

  @AsyncTest(`started function gets called after server is started`)
  async startedMethod() {
    let server: AxonishApolloServer | null = null;
    try {
      let serverStartedInfo: ServerStartedInfo | null = null;
      function isApiConfig(arg: unknown): arg is IApiConfiguration {
        return (arg as IApiConfiguration).setPort !== undefined;
      }
      @AxonishApi()
      class TestApi implements IApiStartup {
        async config(apiConfig: IApiConfiguration): Promise<void> {
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
      Expect(server! instanceof ApolloServer).toBe(true);
      Expect((server! as AxonishApolloServer).express).toBeDefined();
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
      await (server! as AxonishApolloServer).stop();
      Expect(response.books.length).toBe(2);
      Expect(response.books[0].title).toBe(
        "Harry Potter and the Chamber of Secrets"
      );
      Expect(response.books[0].author).toBe("J.K. Rowling");
    } finally {
      await server!.stop();
    }
  }

  @AsyncTest(`Ability to change port`)
  async changePort() {
    let server: AxonishApolloServer | null = null;
    try {
      let serverStartedInfo: ServerStartedInfo | null = null;
      function isApiConfig(arg: unknown): arg is IApiConfiguration {
        return (arg as IApiConfiguration).setPort !== undefined;
      }
      @AxonishApi()
      class TestApi implements IApiStartup {
        async config(apiConfig: IApiConfiguration): Promise<void> {
          await Promise.resolve();
          apiConfig.setPort(3005);
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
      Expect(server! instanceof ApolloServer).toBe(true);
      Expect((server! as AxonishApolloServer).express).toBeDefined();
      Expect(serverStartedInfo).not.toBeNull();
      Expect((serverStartedInfo! as ServerStartedInfo).port).toBe(3005);
      const response = await gqlFetch<Books>(
        (serverStartedInfo! as ServerStartedInfo).port as number,
        `{
      books {
        title,
        author
      }
    }`
      );
      await (server! as AxonishApolloServer).stop();
      Expect(response.books.length).toBe(2);
      Expect(response.books[0].title).toBe(
        "Harry Potter and the Chamber of Secrets"
      );
      Expect(response.books[0].author).toBe("J.K. Rowling");
    } finally {
      await server!.stop();
    }
  }

  @AsyncTest(`possibility of setting custom schema`)
  async customSchema() {
    let server: AxonishApolloServer | null = null;
    try {
      type Contact = {
        name: string;
        phone: string;
      };
      type Contacts = { contacts: Contact[] };
      @AxonishApi()
      class TestApi implements IApiStartup {
        async config(apiConfig: IApiConfiguration): Promise<void> {
          const contacts: Contact[] = [
            {
              name: "Harry Potter",
              phone: "123456789"
            },
            {
              name: "Michael Crichton",
              phone: "12432345"
            }
          ];

          // Type definitions define the "shape" of your data and specify
          // which ways the data can be fetched from the GraphQL server.
          const typeDefs = gql`
            # Comments in GraphQL are defined with the hash (#) symbol.
            # This "Book" type can be used in other type declarations.
            type Contact {
              name: String
              phone: String
            }

            # The "Query" type is the root of all GraphQL queries.
            # (A "Mutation" type will be covered later on.)
            type Query {
              contacts: [Contact]
            }
          `;

          // Resolvers define the technique for fetching the types in the
          // schema.  We'll retrieve books from the "books" array above.
          const resolvers = {
            Query: {
              contacts: () => contacts
            }
          };
          apiConfig.setSchema(makeExecutableSchema({ typeDefs, resolvers }));
        }
        async starting(graphqlServer: AxonishApolloServer): Promise<void> {
          await Promise.resolve();
        }
        async started(
          graphqlServer: AxonishApolloServer,
          info: ServerStartedInfo
        ) {
          server = graphqlServer;
        }
        onError(err: any): void {}
      }
      await __AxonishApiAwaitForUnitTest();

      const response = await gqlFetch<Contacts>(
        3000,
        `{
        contacts {
          name,
          phone
        }
      }`
      );
      Expect(response.contacts.length).toBe(2);
      Expect(response.contacts[0].name).toBe("Harry Potter");
      Expect(response.contacts[0].phone).toBe("123456789");
    } finally {
      await server!.stop();
    }
  }

  @AsyncTest(`possibility to add convention`)
  async convention() {
    let server: AxonishApolloServer | null = null;
    try {
      let conventionCalled: boolean = false;
      const customConvention = (apiConfig: IApiConfiguration) => {
        conventionCalled = true;
      };
      @AxonishApi()
      class TestApi implements IApiStartup {
        async config(apiConfig: IApiConfiguration): Promise<void> {
          apiConfig.addConvention(customConvention);
        }
        async starting(graphqlServer: AxonishApolloServer): Promise<void> {
          await Promise.resolve();
        }
        async started(
          graphqlServer: AxonishApolloServer,
          info: ServerStartedInfo
        ) {
          server = graphqlServer;
        }
        onError(err: any): void {}
      }
      await __AxonishApiAwaitForUnitTest();
      Expect(conventionCalled).toBe(true);
    } finally {
      await server!.stop();
    }
  }

  @Timeout(2000000)
  @AsyncTest("resolver-convention should figure out type-graphql resolvers")
  async checkResolverConvention() {
    let server: AxonishApolloServer | null = null;
    try {
      __InjectRootDir(__dirname);
      __ClearVisitedGlobsForUnitTest();
      __InjectConventionsForUnitTest([
        "../test-utils/hello-resolvers/*.resolver.{ts,js}"
      ]);
      @AxonishApi()
      class TestApi implements IApiStartup {
        async config(apiConfig: IApiConfiguration): Promise<void> {
          apiConfig.setPort(3010);
        }
        async starting(graphqlServer: AxonishApolloServer): Promise<void> {
          await Promise.resolve();
        }
        async started(
          graphqlServer: AxonishApolloServer,
          info: ServerStartedInfo
        ) {
          server = graphqlServer;
        }
        onError(err: any): void {}
      }
      await __AxonishApiAwaitForUnitTest();
      const response = await gqlFetch<{ hello: string }>(
        3010,
        `{
        hello(arg:"World")
      }`
      );
      Expect(response.hello).toBe("Hello World");
      __InjectRootDir(__dirname);
    } finally {
      await server!.stop();
    }
  }
}
