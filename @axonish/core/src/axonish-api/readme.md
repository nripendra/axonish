# AxonishApi

This decorator will signify the entry point to our system. Our system will consist of two distinct parts:

- API
- Microservices.

One API end-point and one or more microservices. AxonishApi is to be used only for the API entry point.

## Usage

```ts
@AxonishApi()
class MyShopApiGateWay implements IApiStartup {
  config(appConfig: IApiConfiguration): void | Promise<void> {
    appConfig.setPort(3000);
  }

  starting(graphqlServer: ApolloServer): void | Promise<void> {
    // Axonish uses express.js to host http server.
    // Here you can modify express.js application instance
    // if desired, e.g: adding additional pipeline.
  }

  started(
    graphqlServer: ApolloServer,
    info: { address: string; port: string | number }
  ): void | Promise<void> {
    // This function is called once express.js application instance
    // is started. It exposes the host, and port of the http server.
    // Not sure if this function has any use, other than console.log.
  }

  onError(err: any): void | Promise<void> {
    // This function is called if there is some failure on starting up
    // express.js application server.
  }
}
```

## IApiStartup

Will have following members

- `config(appConfig: IApiConfiguration): void | Promise<void>`
  Here we will configure our api endpoints.

- `starting(graphqlServer: ApolloServer): void | Promise<void>`
  Here we'll get to configure ApolloServer and express.js server before things are running.

- `started(graphqlServer: ApolloServer, info: { address: string; port: string | number }): void | Promise<void>`
  Just a notification that we are now running our graphql server

- `onError(err: any): void | Promise<void>`
  A notification that our system has crashed

## IApiConfiguration

Will have following members

- `setPort(portNumber: number)`
  Set the port number on which we need to run the graphql server on. Default will be 3000 (Can change in future)
- `setSchema(schema: GraphQLSchema): void;`
  Set an "executable" graphql schema that should be served. Note that, executable schema means type defs and resolvers.
- `addConvention(convention: ApiConvention): void;`
  Support for user-defined conventions. As of now, there is only built in convention: the `resolver-convention`.
