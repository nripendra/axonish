import { GraphQLSchema } from "graphql";
import { ApiConvention } from "../axonish-api/api-convention";
import Container from "typedi";

export default interface IApiConfiguration {
  setSchema(schema: GraphQLSchema): void;
  setPort(port: number): void;
  addConvention(convention: ApiConvention): void;

  services: typeof Container;
}
