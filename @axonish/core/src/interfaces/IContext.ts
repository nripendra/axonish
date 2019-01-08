import IAuthUser from "./IAuthUser";

export default interface IContext<T extends IAuthUser> {
  user?: T;
}
