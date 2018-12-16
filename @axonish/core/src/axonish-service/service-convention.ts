import IServiceConfiguration from "../interfaces/IServiceConfiguration";

export type ServiceConvention = (serviceConfig: IServiceConfiguration) => void | Promise<void>;