import ICqrsConfiguration from "../interfaces/ICqrsConfiguration";
import { IServiceConfiguration } from "@axonish/core";
import { ConnectionOptions } from "pogi";
import Container from "typedi";

export class CqrsConfiguration implements ICqrsConfiguration {
  constructor(public parent: IServiceConfiguration) {}
  _connection: ConnectionOptions = {};
  get connection() {
    return this._connection;
  }
  usePostgres(connection: ConnectionOptions) {
    this._connection = connection;
  }

  get services(): typeof Container {
    return Container;
  }
}
