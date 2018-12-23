import { Message, ClassOf } from "@axonish/core";
import { forceConvert } from "../util/force-convert";
export type QueryHandlerFunction<TQueryPayload, TQueryResponse> = (
  event: Message<TQueryPayload, TQueryResponse>
) => Promise<TQueryResponse> | TQueryResponse;

export type QueryHandlerDictionary<T, R> = {
  [queryType: string]: QueryHandlerFunction<T, R>;
};

const queryHandlers: QueryHandlerDictionary<any, any> = {};

export function addQueryHandler<T, R>(
  queryType: string,
  handlerFunction: QueryHandlerFunction<T, R>,
  queryClass: ClassOf<unknown>
) {
  queryHandlers[queryType] = handlerFunction;
}

export function getQueryHandler<T, R>(queryType: string) {
  return forceConvert<QueryHandlerFunction<T, R>>(queryHandlers[queryType]);
}

export function getAllQueryHandlers() {
  return { ...queryHandlers };
}

export function clearQueryHandlersForTest() {
  for (const key in queryHandlers) {
    delete queryHandlers[key];
  }
}
