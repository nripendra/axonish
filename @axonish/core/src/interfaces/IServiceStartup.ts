import IServiceConfiguration from "./IServiceConfiguration";

export default interface IServiceStartup {
  config(serviceConfig: IServiceConfiguration): void | Promise<void>;

  onError(err: any): void;
}
