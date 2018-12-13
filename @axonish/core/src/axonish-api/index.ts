import IApiStartup from "../interfaces/IApiStartup";

type ClassOf<T> = {
  new (...args: any[]): T;
};
type AxonishApiReturnType = (constructor: ClassOf<IApiStartup>) => void;
export function AxonishApi(): AxonishApiReturnType {
  return (constructor: ClassOf<IApiStartup>) => {};
}
