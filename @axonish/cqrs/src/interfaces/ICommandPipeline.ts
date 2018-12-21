import IAggregateRoot from "./IAggregateRoot";
import { Command } from "../common/command";

export interface ICommandPipeline<TPayload, TResponsePayload> {
  before(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;

  after(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;

  comitting(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;

  comitted(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;

  finally(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;

  error<T extends Error>(
    error: T,
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;
}
