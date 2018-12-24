import { ClassOf } from "@axonish/core";
import { Command } from "../common/command";
import ICommandPipeline from "../interfaces/ICommandPipeline";
import { addPipeline } from "./metadata";

export function Pipeline<TPayload, TResponsePayload>(
  commandOrType: Command<TPayload, TResponsePayload> | string
) {
  return (
    pipelineClass: ClassOf<ICommandPipeline<TPayload, TResponsePayload>>
  ) => {
    const type = isCommand(commandOrType) ? commandOrType.type : commandOrType;
    addPipeline(type, pipelineClass);
  };
}

function isCommand<TPayload, TResponsePayload>(
  commandOrType: any
): commandOrType is Command<TPayload, TResponsePayload> {
  return (
    (commandOrType as Command<TPayload, TResponsePayload>).type !== undefined
  );
}
