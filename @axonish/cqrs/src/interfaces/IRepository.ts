import { AggregateId } from "../common/aggregate-id";

export default interface IRepository {
  find<TAggregate>(
    aggregateType: new (...args: unknown[]) => TAggregate,
    aggregateId: AggregateId
  ): Promise<TAggregate | null>;
  save(aggregates: unknown[]): Promise<void>;
}
