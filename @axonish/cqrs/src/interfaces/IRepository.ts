import { AggregateId } from "../common/aggregate-id";

export interface IRepository {
  findAll(
    descriptors: Array<{
      aggregateId: AggregateId;
      aggregateType: new (...args: unknown[]) => unknown;
    }>
  ): Promise<unknown[]>;
  find<TAggregate>(
    aggregateType: new (...args: unknown[]) => TAggregate,
    aggregateId: AggregateId
  ): Promise<TAggregate | null>;
  save(aggregates: unknown[]): Promise<void>;
}
