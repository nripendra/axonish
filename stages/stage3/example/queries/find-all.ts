import { Message } from "@axonish/core/src/common/message";
import { Recipe } from "../dtos/recipe";

export type FindAllRecipeQuery = Message<{}, Recipe[]>;
export function FindAllRecipe(): FindAllRecipeQuery {
  return new Message<{}, Recipe[]>("FindAllRecipe", {});
}
