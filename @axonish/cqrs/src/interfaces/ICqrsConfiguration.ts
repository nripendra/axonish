import { IServiceConfiguration } from "@axonish/core";
import { ConnectionOptions } from "pogi";
import Container from "typedi";

export default interface ICqrsConfiguration {
  parent: IServiceConfiguration;
  usePostgres(connection: ConnectionOptions): void;

  services: typeof Container;
}
