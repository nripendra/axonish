import { IServiceConfiguration } from "@axonish/core";
import { ConnectionOptions } from "pogi";
import Container from "typedi";

export interface ICqrsConfiguration {
  parent: IServiceConfiguration;
  usePostgres(connection: ConnectionOptions): Promise<void>;

  services: typeof Container;
}
