export type ClassOf<T> = {
  new(...args: any[]): T;
};
