import { ClassOf } from "../common";
import IServiceStartup from "../interfaces/IServiceStartup";
import { ServiceConfig } from "./service-config";
import { directoryConvention, setGlobOptions } from "./directory-convention";
import "reflect-metadata";
import { ServiceConvention } from "./service-convention";
import * as path from "path";
import { ServiceConfigurationToken, MessageResponderToken } from "../tokens";
import { MessageResponder } from "../message-responder";

export type AxonishServiceReturnType = (
  constructor: ClassOf<IServiceStartup>
) => void;

let _initilizingServicePromise: Promise<void> = Promise.resolve();

export async function __AxonishServiceAwaitForUnitTest() {
  await _initilizingServicePromise;
}

export function AxonishService(serviceName: string): AxonishServiceReturnType {
  return (constructor: ClassOf<IServiceStartup>) => {
    const serviceConfig = new ServiceConfig();
    serviceConfig.setServiceName(serviceName);
    serviceConfig.services.set(ServiceConfigurationToken, serviceConfig);
    serviceConfig.services.set(
      MessageResponderToken,
      new MessageResponder(serviceName)
    );
    const requiring_module = module.parent!.filename;
    setGlobOptions({
      cwd: path.dirname(requiring_module),
      ignore: ["**/**/*.d.ts", "**/**/*.map", "**/node_modules/", "**/dist/"]
    });
    serviceConfig.addConvention(directoryConvention);
    const instance: IServiceStartup = new constructor();
    _initilizingServicePromise = (async () => {
      const configResult = instance.config(serviceConfig);
      if (configResult && configResult.then) {
        await configResult;
      }
      const callConvention = (convention: ServiceConvention) =>
        convention(serviceConfig);
      const isPromise = (x: void | Promise<void>) => x && x.then;
      await Promise.all(
        serviceConfig.conventions.map(callConvention).filter(isPromise)
      );
    })();
  };
}