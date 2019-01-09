import { IApiConfiguration } from "..";

export default interface IContext {
  req: any;
  config: IApiConfiguration;
}
