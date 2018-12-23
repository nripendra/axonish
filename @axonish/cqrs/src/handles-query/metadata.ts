import { Message, ClassOf } from "@axonish/core";
import { forceConvert } from "../util/force-convert";
export type QueryHandlerFunction<TQueryPayload, TQueryResponse> = (
  event: Message<TQueryPayload, TQueryResponse>
) => Promise<TQueryResponse> | TQueryResponse;

export type QueryHandlerDictionary<T, R> = {
  [queryType: string]: {
    handlerFn: QueryHandlerFunction<T, R>;
    queryHandlerClass: ClassOf<unknown>;
  };
};

const queryHandlers: QueryHandlerDictionary<any, any> = {};

export function addQueryHandler<T, R>(
  queryType: string,
  handlerFn: QueryHandlerFunction<T, R>,
  queryHandlerClass: ClassOf<unknown>
) {
  queryHandlers[queryType] = { handlerFn, queryHandlerClass };
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
