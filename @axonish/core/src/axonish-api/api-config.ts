import IApiConfiguration from "../interfaces/IApiConfiguration";

export class ApiConfig implements IApiConfiguration {
  private _port: number = 3000;
  get port() {
    return this._port;
  }
  setPort(port: number): void {
    this._port = port;
  }
}
