import IApiStartup from "../interfaces/IApiStartup";

type ClassOf<T> = {
  new (...args: any[]): T;
};
type AxonishApiReturnType = (constructor: ClassOf<IApiStartup>) => void;
export function AxonishApi(): AxonishApiReturnType {
  return (constructor: ClassOf<IApiStartup>) => {
    const ApiStartupClass = constructor;
    const instance = new ApiStartupClass();
    instance.config({} as any);
    instance.starting({} as any);
    instance.started({} as any, { address: "localhost", port: 3000 });
  };
}
