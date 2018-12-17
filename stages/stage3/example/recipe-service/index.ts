import IServiceStartup from "@axonish/core/dist/interfaces/IServiceStartup";
import { AxonishService } from "@axonish/core/dist/axonish-service";
import IServiceConfiguration from "@axonish/core/dist/interfaces/IServiceConfiguration";

@AxonishService("Recipe-Service")
export class RecipeService implements IServiceStartup {
  config(serviceConfig: IServiceConfiguration): void | Promise<void> {}
  onError(err: any): void {}
}
