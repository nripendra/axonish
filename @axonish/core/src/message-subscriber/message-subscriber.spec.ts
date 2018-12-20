import { TestFixture, AsyncTest, Expect, Timeout, SpyOn } from "alsatian";
import { MessageSubscriber } from ".";
import { Message } from "../common/message";
import { MessagePublisher } from "../message-publisher";

@TestFixture("MessageSubscriber")
export class MessageSubscriberTests {
  @AsyncTest(`MessageSubscriber and MessagePublisher can communicate`)
  @Timeout(2500)
  async Channel() {
    const subscriber = new MessageSubscriber("Test-Service");
    let done = () => {};
    const handler = {
      callback: async (message: TestEventType) => {
        subscriber.close();
        done();
      }
    };
    const spy = SpyOn(handler, "callback");
    subscriber.on(TestEvent(), handler.callback);
    const bus = new MessagePublisher("Test-Service");
    const defer = new Promise(resolve => (done = resolve));
    bus.publish(TestEvent({ message: "Hello" }));
    await defer;

    Expect(spy).toHaveBeenCalled();
  }

  @AsyncTest(`Subscriber error is ignored`)
  @Timeout(2500)
  async ChannelError() {
    const subscriber = new MessageSubscriber("Test-Service");
    let done = () => {};
    const handler = {
      callback: async (message: TestEventType) => {
        try {
          throw new Error("Something went wrong");
        } finally {
          done();
          subscriber.close();
        }
      }
    };
    const spy = SpyOn(handler, "callback");
    subscriber.on(TestEvent(), handler.callback);
    const bus = new MessagePublisher("Test-Service");
    const defer = new Promise(resolve => (done = resolve));
    let error: Error | null = null;
    try {
      bus.publish(TestEvent({ message: "Hello" }));
    } catch (e) {
      error = e;
    }
    await defer;
    Expect(spy).toHaveBeenCalled();
    Expect(error).toBeNull();
  }
}

interface TestPayload {
  message: string;
}

type TestEventType = Message<TestPayload, void>;
function TestEvent(payload?: TestPayload): TestEventType {
  return new Message<TestPayload, void>(
    TestEvent.name,
    payload || { message: "" }
  );
}
