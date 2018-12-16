import IServiceConfiguration from "../interfaces/IServiceConfiguration";
import { ServiceConvention } from "./service-convention";

export class ServiceConfig implements IServiceConfiguration {
  _serviceName: string = "";
  get serviceName(): string {
    return this._serviceName;
  }
  setServiceName(serviceName: string) {
    this._serviceName = serviceName;
  }
  _conventions: ServiceConvention[] = [];
  get conventions(): ReadonlyArray<ServiceConvention> {
    return [...this._conventions];
  }
  addConvention(convention: ServiceConvention): void {
    this._conventions.push(convention);
  }
}
