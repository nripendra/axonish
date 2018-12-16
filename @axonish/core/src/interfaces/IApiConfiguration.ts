import { GraphQLSchema } from "graphql";
import { ApiConvention } from "../axonish-api/api-convention";

export default interface IApiConfiguration {
  setSchema(schema: GraphQLSchema): void;
  setPort(port: number): void;
  addConvention(convention: ApiConvention): void;
}
