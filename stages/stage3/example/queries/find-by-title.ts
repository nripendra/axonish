import { Message } from "@axonish/core/src/common/message";
import { Recipe } from "../dtos/recipe";

export type FindRecipeByTitleQueryPayload = { title: string };
export type FindRecipeByTitleQuery = Message<
  FindRecipeByTitleQueryPayload,
  Recipe | undefined
>;
export function FindRecipeByTitle(
  payload?: FindRecipeByTitleQueryPayload
): FindRecipeByTitleQuery {
  return new Message<FindRecipeByTitleQueryPayload, Recipe | undefined>(
    "FindRecipeByTitle",
    payload || { title: "" }
  );
}
