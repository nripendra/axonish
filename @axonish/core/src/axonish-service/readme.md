# AxonishService

This is another decorator that indicates an entry point to a micro-service.

## Usage

```ts
@AxonishService("User-Service")
class UserService implements IServiceStartup {
  config(serviceConfig: IServiceConfiguration): void | Promise<void> {}
}
```

I cannot think of this decorator doing much. This will just serve as an entry point, other than that it may pick up the files that will
do actual microservice works based on conventions. `IServiceConfiguration` does have very few methods.

## IServiceConfiguration

- `addConvention`: Similar concept to AxonishApi configuration.
