import { ICommandPipeline } from "../interfaces/ICommandPipeline";
import { ClassOf } from "@axonish/core";

type PipelineDictionary<T, T2> = {
  [commandType: string]: Array<ClassOf<ICommandPipeline<T, T2>>>;
};
const pipelineDictionary: PipelineDictionary<unknown, unknown> = {};
export function addPipeline<TPayload, TResponsePayload>(
  commandType: string,
  pipelineType: ClassOf<ICommandPipeline<TPayload, TResponsePayload>>
) {
  const pipelines = pipelineDictionary[commandType] || [];
  pipelines.push(pipelineType);
  pipelineDictionary[commandType] = pipelines;
}

export function clearPipelinesForTest() {
  for (const commandType in pipelineDictionary) {
    delete pipelineDictionary[commandType];
  }
}

export function getPipelines(
  commandType: string
): ReadonlyArray<ClassOf<ICommandPipeline<unknown, unknown>>> {
  return [...(pipelineDictionary[commandType] || [])];
}

export function getAllPipelines() {
  return { ...pipelineDictionary };
}
