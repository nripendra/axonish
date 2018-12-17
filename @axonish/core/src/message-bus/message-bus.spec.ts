import {
  Expect,
  TestCase,
  Timeout,
  TestFixture,
  AsyncTest,
  SpyOn,
  FocusTest,
  Test,
  FocusTests
} from "alsatian";
import { MessageBus } from ".";
import { Message } from "../common/message";
import * as cote from "cote";
import IApiStartup, { ServerStartedInfo } from "../interfaces/IApiStartup";
import IMessageBus from "../interfaces/IMessageBus";
import IApiConfiguration from "../interfaces/IApiConfiguration";
import {
  AxonishApolloServer,
  AxonishApi,
  __AxonishApiAwaitForUnitTest
} from "../axonish-api";
import { gqlFetch } from "../test-utils/gql-fetch";
import {
  Resolver,
  Query,
  Arg,
  buildSchema,
  ObjectType,
  Field,
  InputType
} from "type-graphql";
import { Inject } from "typedi";
import { MessageBusService } from "../tokens";
import { MessageResponder } from "../message-responder";

const responder = new MessageResponder("Test-Channel");

responder.on(CreateTest({ message: "" }), async message => {
  return {
    success: true,
    received: message.payload!.message
  };
});

@TestFixture("MessageBus")
export class MessageBusTests {
  @Test(`MessageBus exposes channels`)
  Channel() {
    const bus = new MessageBus();
    const channel = bus.channel("Test-Channel");
    Expect(channel).not.toBeNull();
  }

  @AsyncTest(`Message can be sent through channel`)
  @Timeout(2500)
  async SendMessageThroughChannel() {
    const bus = new MessageBus();
    const channel = bus.channel("Test-Channel");
    Expect(channel).not.toBeNull();
    const response = await channel.send(CreateTest({ message: "Hello" }));
    Expect(response.received).toEqual("Hello");
  }

  @AsyncTest(`MessageBus is injected to resolvers`)
  @Timeout(2500)
  async canBeInjectedIntoResolvers() {
    let server: AxonishApolloServer | null = null;

    @Resolver(t => TestPayload)
    class MyResolver {
      constructor(@Inject(MessageBusService) private _bus: IMessageBus) {}
      @Query(returns => TestResponse)
      async hello(@Arg("input") arg: TestPayload): Promise<TestResponse> {
        return await this._bus.channel("Test-Channel").send(
          CreateTest({
            message: arg.message
          })
        );
      }
    }

    @AxonishApi()
    class MyTestApi implements IApiStartup {
      async config(apiConfig: IApiConfiguration): Promise<void> {
        apiConfig.setSchema(
          await buildSchema({
            resolvers: [MyResolver]
          })
        );
      }
      starting(graphqlServer: AxonishApolloServer): void | Promise<void> {}
      started(
        graphqlServer: AxonishApolloServer,
        info: ServerStartedInfo
      ): void | Promise<void> {
        server = graphqlServer;
      }
      onError(err: any): void {}
    }
    await __AxonishApiAwaitForUnitTest();
    try {
      let response = await gqlFetch<{ hello: TestResponse }>(
        3000,
        `query {
            hello(input : { message: "ping" }) {
                received
            }
        }`
      );
      Expect(response.hello.received).toBe("ping");
    } catch (e) {
      throw e;
    } finally {
      await server!.stop();
    }
  }
}

@InputType()
class TestPayload {
  @Field()
  message: string = "";
}

@ObjectType()
class TestResponse {
  @Field()
  received: string = "";
}

type TestCommand = Message<TestPayload, TestResponse>;
function CreateTest(payload: TestPayload): TestCommand {
  return new Message<TestPayload, TestResponse>("TestCommand", payload);
}
