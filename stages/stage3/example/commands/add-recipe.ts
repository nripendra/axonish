import { Message } from "@axonish/core/src/common/message";
import { Recipe } from "../dtos/recipe";

export type AddRecipeCommand = Message<Recipe, Recipe>;
export function AddRecipe(payload?: Recipe): AddRecipeCommand {
  return new Message<Recipe, Recipe>("AddRecipe", payload);
}
