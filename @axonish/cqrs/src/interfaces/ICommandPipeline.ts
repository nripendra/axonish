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

  committing(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;

  committed(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;

  finally(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>
  ): Promise<void> | void;

  error<T extends Error>(
    aggregateRoot: IAggregateRoot,
    command: Command<TPayload, TResponsePayload>,
    error: T
  ): Promise<void> | void;
}
