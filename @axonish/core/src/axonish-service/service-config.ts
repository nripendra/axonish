import IServiceConfiguration from "../interfaces/IServiceConfiguration";
import { ServiceConvention } from "./service-convention";
import Container from "typedi";

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

  get services(): typeof Container {
    return Container;
  }

  private _done: Array<() => Promise<void> | void> = [];
  get doneCallbacks() {
    return this._done;
  }
  onDone(callback: () => Promise<void> | void): void {
    this._done.push(callback);
  }
}
