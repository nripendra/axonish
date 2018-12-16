import { AxonishApi, AxonishApolloServer } from "@axonish/core/src/axonish-api";
import IApiStartup from "@axonish/core/src/interfaces/IApiStartup";
import IApiConfiguration from "@axonish/core/src/interfaces/IApiConfiguration";
import { buildSchema } from "type-graphql";

@AxonishApi()
export class MyShopApiGateWay implements IApiStartup {
  async config(appConfig: IApiConfiguration): Promise<void> {
    const schema = await buildSchema({
      resolvers: [__dirname + "/resolvers/recipe-resolver.ts"]
    });
    appConfig.setSchema(schema);
  }

  starting(graphqlServer: AxonishApolloServer): void {}

  started(
    graphqlServer: AxonishApolloServer,
    info: { address: string; port: string | number }
  ): void | Promise<void> {
    console.log("Started graphql server on port " + info.port);
  }

  onError(err: any): void {}
}
