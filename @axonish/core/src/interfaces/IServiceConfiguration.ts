import { ServiceConvention } from "../axonish-service/service-convention";
import Container from "typedi";

export interface IServiceConfiguration {
  readonly serviceName: string;
  addConvention(convention: ServiceConvention): void;

  services: typeof Container;

  onDone(callback: () => Promise<void> | void): void;
}
