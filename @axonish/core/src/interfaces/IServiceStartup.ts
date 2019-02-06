import { IServiceConfiguration } from "./IServiceConfiguration";

export interface IServiceStartup {
  config(serviceConfig: IServiceConfiguration): void | Promise<void>;

  onError(err: any): void;
}
