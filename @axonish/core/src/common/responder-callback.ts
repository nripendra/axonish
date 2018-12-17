import { Message } from "./message";

export type ResponderCallback<T, U> = (message: Message<T, U>) => Promise<U>;
