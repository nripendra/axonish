import IApiStartup from "../interfaces/IApiStartup";

type ClassOf<T> = {
  new (...args: any[]): T;
};
type AxonishApiReturnType = (constructor: ClassOf<IApiStartup>) => void;

/**
 * HACK!! Just for awaiting in Unit tests.
 */
let _initilizingApiPromise: Promise<void> = Promise.resolve();
export async function __AxonishApiAwaitForUnitTest() {
  await _initilizingApiPromise;
}

export function AxonishApi(): AxonishApiReturnType {
  return (constructor: ClassOf<IApiStartup>) => {
    const ApiStartupClass = constructor;
    const instance = new ApiStartupClass();
    _initilizingApiPromise = (async () => {
      const configResult = instance.config({} as any);
      if (configResult && configResult.then) {
        await configResult;
      }
      const startingResult = instance.starting({} as any);
      if (startingResult && startingResult.then) {
        await startingResult;
      }
      const startedResult = instance.started({} as any, {
        address: "localhost",
        port: 3000
      });
      if (startedResult && startedResult.then) {
        await startedResult;
      }
    })();
  };
}
