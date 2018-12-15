import IApiConfiguration from "../interfaces/IApiConfiguration";
import { GraphQLSchema } from "graphql";
export class ApiConfig implements IApiConfiguration {
  private _port: number = 3000;
  get port() {
    return this._port;
  }
  setPort(port: number): void {
    this._port = port;
  }

  private _schema: GraphQLSchema | null = null;
  get schema() {
    return this._schema;
  }
  setSchema(schema: GraphQLSchema): void {
    this._schema = schema;
  }
}
