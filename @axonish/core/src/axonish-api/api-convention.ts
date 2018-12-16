import IApiConfiguration from "../interfaces/IApiConfiguration";

export type ApiConvention = (apiConfig: IApiConfiguration) => void | Promise<void>;
