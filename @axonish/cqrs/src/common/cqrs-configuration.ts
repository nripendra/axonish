import { ICqrsConfiguration } from "../interfaces/ICqrsConfiguration";
import { IServiceConfiguration } from "@axonish/core";
import { ConnectionOptions } from "pogi";
import { EventStoreToken } from "../tokens";
import { PgEventStore } from "../event-store";
import { Container } from "typedi";

export class CqrsConfiguration implements ICqrsConfiguration {
  constructor(public parent: IServiceConfiguration) {}
  _connection: ConnectionOptions = {};
  get connection() {
    return this._connection;
  }
  async usePostgres(connection: ConnectionOptions) {
    this._connection = connection;
    const eventStore = new PgEventStore();
    await eventStore.connect(connection);
    this.services.set(EventStoreToken, eventStore);
  }

  get services(): typeof Container {
    return this.parent.services;
  }
}
