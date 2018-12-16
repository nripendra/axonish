import { ServiceConvention } from "../axonish-service/service-convention";

export default interface IServiceConfiguration {
  readonly serviceName: string;
  addConvention(convention: ServiceConvention): void;
}
