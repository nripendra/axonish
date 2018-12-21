We'll have a lot of decorators I'm at least counting 9 of them:

- @AxonishApi
- @AxonishService
- @AggregateRoot
  - @HandlesCommand
- @Projection
- @EventReactor
- @HandlesEvent
- @Pipeline

For graph-ql, we'll be using the decorators directly from type-graphql. Need to decide, whether to take type-graphql as peer dependency,
or a direct dependency. In case of peer dependency, we'll document on how to install and use type-graphql. In case of direct dependency,
we'll expose the type-graphql decorators as part of axonish. As of now I'm more inclined towards peer-depenency.

Now, from architectural point of view, we'll have one API process which will expose graphql endpoints, and several microservice processes, which will communicate over "cote". This is where @AxonishApi and @AxonishService decorators come into picture. These are the
entry points to api process, and micro-service process. First thing that I'll implement is going to be the @AxonishApi decorator. The
usage that I'm thinking is as follows:

```ts
// index.ts
@AxonishApi()
export class MyShopApiGateWay implements IApiStartup {
  config(appConfig: IApiConfiguration): void | Promise<void> {
    // change your configurations here..
  }

  starting(graphqlServer: ApolloServer): void {
    // Axonish uses express.js to host http server.
    // Here you can modify express.js application instance
    // if desired, e.g: adding additional pipeline.
  }

  started(
    graphqlServer: ApolloServer,
    info: { address: string; port: string | number }
  ): void | Promise<void> {
    console.log("Started graphql server on port " + info.port);
  }

  onError(err: any): void {
    // This function is called if there is some failure on starting up
    // express.js application server.
  }
}
```

Now, once we compile the code and run the thing, we'll get a default graphql server running at port 3000
