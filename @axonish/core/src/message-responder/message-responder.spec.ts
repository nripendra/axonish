import { TestFixture, AsyncTest, Expect, Timeout } from "alsatian";
import { MessageResponder } from ".";
import { Message } from "../common/message";
import { MessageBus } from "../message-bus";

@TestFixture("MessageResponder")
export class MessageResponderTests {
  @AsyncTest(`MessageBus and responder can communicate over channels`)
  @Timeout(2500)
  async Channel() {
    const responder = new MessageResponder("Test-Service");
    responder.on(TestCommand(), (message: TestCommandType) => {
      return Promise.resolve({
        success: true,
        received: message.payload.message
      });
    });
    const bus = new MessageBus();
    const channel = bus.channel("Test-Service");
    const response = await channel.send(TestCommand({ message: "Hello" }));
    Expect(response.success).toBe(true);
    Expect(response.received).toBe("Hello");
    responder.close();
  }

  @AsyncTest(`Channel can get errors from responder`)
  @Timeout(2500)
  async ChannelError() {
    const responder = new MessageResponder("Test-Service");
    responder.on(TestCommand(), (message: TestCommandType) => {
      return Promise.reject(new Error("Something went wrong"));
    });
    const bus = new MessageBus();
    const channel = bus.channel("Test-Service");
    let error: Error | null = null;
    try {
      const response = await channel.send(TestCommand({ message: "Hello" }));
    } catch (e) {
      error = e;
    }
    Expect(error).not.toBeNull();
    Expect(error!.message).toBe("Something went wrong");
    Expect(error!.stack).not.toBeNull();
    Expect(error!.toString()).not.toBeNull();
    responder.close();
  }
}

interface TestPayload {
  message: string;
}

interface TestResponse {
  success: boolean;
  received: string;
}

type TestCommandType = Message<TestPayload, TestResponse>;
function TestCommand(payload?: TestPayload): TestCommandType {
  return new Message<TestPayload, TestResponse>(
    "TestCommand",
    payload || { message: "" }
  );
}
