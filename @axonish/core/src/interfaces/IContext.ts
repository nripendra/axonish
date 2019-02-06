import { IApiConfiguration } from "..";

export interface IContext {
  req: any;
  config: IApiConfiguration;
}
