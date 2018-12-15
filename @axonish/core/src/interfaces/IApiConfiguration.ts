import { GraphQLSchema } from "graphql";

export default interface IApiConfiguration {
  setSchema(schema: GraphQLSchema): void;
  setPort(port: number): void;
}
