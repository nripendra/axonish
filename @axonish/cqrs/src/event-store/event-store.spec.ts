import {
  TestFixture,
  Expect,
  AsyncTest,
  Timeout,
  AsyncSetupFixture,
  AsyncTeardownFixture
} from "alsatian";
import PgEventStore from ".";
import { exec, ExecException } from "child_process";
import { PgDb, ConnectionOptions } from "pogi";
import { join } from "path";
import { DomainEvent } from "../common/domain-event";
import { Snap } from "../common/snap";

const connection: ConnectionOptions = {
  host: "127.0.0.1",
  database: "EventStore",
  user: "vagrant",
  password: "vagrant",
  port: 5433
};
@TestFixture()
export class EventStoreSpecs {
  @AsyncSetupFixture
  async setupFixture() {
    // this function will be run ONCE before any test has run
    // you can use this to do setup that needs to happen only once
    console.log("vagrant up [starting...]");
    await new Promise(function(resolve) {
      exec(
        "vagrant up --provision",
        { cwd: __dirname },
        (error: ExecException | null, stdout: string, stderr: string) => {
          resolve();
        }
      );
    });
    console.log("vagrant up [done]");

    console.log("Creating tables [starting...]");

    const db: PgDb = await PgDb.connect(connection);
    await db.execute(join(__dirname, "./create-events.sql"));
    await db.execute(join(__dirname, "./create-snaps.sql"));
    await db.close();
    console.log("Creating tables [Done]");
  }

  @AsyncTest()
  async saveEvents() {
    const eventstore: PgEventStore = new PgEventStore();
    await eventstore.connect(connection);

    await eventstore._clear_for_test();
    await eventstore.saveEvents([
      {
        aggregateId: "1",
        events: [
          new DomainEvent<{ value: number }>(
            "Create",
            { value: 1 },
            "MyAggregateType",
            "1"
          ),
          new DomainEvent<{ value: number }>(
            "ChangeValue",
            { value: 5 },
            "MyAggregateType",
            "1"
          ),
          new DomainEvent<{ value: number }>(
            "ChangeValue",
            { value: 15 },
            "MyAggregateType",
            "1"
          )
        ],
        expectedVersion: 0
      }
    ]);
    const events = await eventstore.getEventsByLatestSnapShot("1");
    Expect(events.length).toBe(3);

    Expect(events[0]!.aggregateId!).toBe("1");
    Expect(events[0]!.index).toBe(1);
    Expect(events[0]!.previousEventIndex!).toBe(0);
    Expect(events[0]!.aggregateType).toBe("MyAggregateType");
    Expect(events[0]!.eventType).toBe("Create");
    Expect((events[0]!.payload as { value: number }).value).toBe(1);

    Expect(events[1]!.aggregateId!).toBe("1");
    Expect(events[1]!.index).toBe(2);
    Expect(events[1]!.previousEventIndex).toBe(1);
    Expect(events[1]!.aggregateType).toBe("MyAggregateType");
    Expect(events[1]!.eventType).toBe("ChangeValue");
    Expect((events[1]!.payload as { value: number }).value).toBe(5);

    Expect(events[2]!.aggregateId!).toBe("1");
    Expect(events[2]!.index).toBe(3);
    Expect(events[2]!.previousEventIndex).toBe(2);
    Expect(events[2]!.aggregateType).toBe("MyAggregateType");
    Expect(events[2]!.eventType).toBe("ChangeValue");
    Expect((events[2]!.payload as { value: number }).value).toBe(15);
  }

  @AsyncTest()
  async saveEventsAndSnaps() {
    const eventstore: PgEventStore = new PgEventStore();
    await eventstore.connect(connection);

    await eventstore._clear_for_test();
    await eventstore.saveEvents([
      {
        aggregateId: "1",
        events: [
          new DomainEvent<{ value: number }>(
            "Create",
            { value: 1 },
            "MyAggregateType",
            "1"
          ),
          new DomainEvent<{ value: number }>(
            "ChangeValue",
            { value: 5 },
            "MyAggregateType",
            "1"
          ),
          new Snap({ value: 5 }, "MyAggregateType", "1"),
          new DomainEvent<{ value: number }>(
            "ChangeValue",
            { value: 15 },
            "MyAggregateType",
            "1"
          )
        ],
        expectedVersion: 0
      }
    ]);
    const events = await eventstore.getEventsByLatestSnapShot("1");
    Expect(events.length).toBe(2);

    Expect(events[0]!.aggregateId!).toBe("1");
    Expect(events[0]!.index).toBe(3);
    Expect(events[0]!.previousEventIndex!).toBe(2);
    Expect(events[0]!.aggregateType).toBe("MyAggregateType");
    Expect(events[0]!.eventType).toBe("Snap");
    Expect((events[0]!.payload as { value: number }).value).toBe(5);

    Expect(events[1]!.aggregateId!).toBe("1");
    Expect(events[1]!.index).toBe(4);
    Expect(events[1]!.previousEventIndex).toBe(3);
    Expect(events[1]!.aggregateType).toBe("MyAggregateType");
    Expect(events[1]!.eventType).toBe("ChangeValue");
    Expect((events[1]!.payload as { value: number }).value).toBe(15);
  }

  @AsyncTeardownFixture
  public async asyncTeardownFixture() {
    await new Promise(function(resolve) {
      exec(
        "vagrant halt",
        { cwd: __dirname },
        (error: ExecException | null, stdout: string, stderr: string) => {
          resolve();
        }
      );
    });
  }
}
