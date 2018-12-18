export type ClassOf<T> = {
  new(...args: unknown[]): T;
};
