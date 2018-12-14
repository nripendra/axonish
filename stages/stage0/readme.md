At this point we get a working graphql server with a default Query, and resolver. To get started all we need to do is create an
entry file, normally `index.ts`. In that file add a class that implements `IApiStartup` interface, and adorn the class with the
`@AxonishApi` decorator.

Look inside the example folder. To run example just type following commands:

```
ts-node example
```

Now, start your browser and navigate to http://localhost:3000/graphql url. That's it, you have created a functioning graphql server
with these ~20 LOC.

```ts
import { AxonishApi, AxonishApolloServer } from "@axonish/core/src/axonish-api";
import IApiStartup from "@axonish/core/src/interfaces/IApiStartup";
import IApiConfiguration from "@axonish/core/src/interfaces/IApiConfiguration";

@AxonishApi()
export class MyShopApiGateWay implements IApiStartup {
  config(appConfig: IApiConfiguration): void | Promise<any> {}

  starting(graphqlServer: AxonishApolloServer): void {}

  started(
    graphqlServer: AxonishApolloServer,
    info: { address: string; port: string | number }
  ): void | Promise<void> {
    console.log("Started graphql server on port " + info.port);
  }

  onError(err: any): void {}
}
```

As you can see, it is quite easy to get started and running. However, there isn't much we can do at this point, it just shows a default
hard-coded schema. To be able to do anything meaningfull, we'll need to have ability to provide custom schema.
