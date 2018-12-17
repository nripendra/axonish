import { ServiceConvention } from "../axonish-service/service-convention";
import Container from "typedi";

export default interface IServiceConfiguration {
  readonly serviceName: string;
  addConvention(convention: ServiceConvention): void;

  services: typeof Container;
}
