import { MessageResponder } from "@axonish/core/src/message-responder";
import { FindAllRecipe, FindAllRecipeQuery } from "../../queries/find-all";
import { recipes } from "../recipes";
import {
  FindRecipeByTitle,
  FindRecipeByTitleQuery
} from "../../queries/find-by-title";
import { AddRecipe, AddRecipeCommand } from "../../commands/add-recipe";
const responder = new MessageResponder("Recipe-Service");
responder.on(FindAllRecipe(), async (message: FindAllRecipeQuery) => {
  return recipes;
});

responder.on(FindRecipeByTitle(), async (message: FindRecipeByTitleQuery) => {
  return recipes.find(x => x.title == message.payload!.title);
});

responder.on(AddRecipe(), async (message: AddRecipeCommand) => {
  recipes.push(message.payload!);
  return message.payload!;
});
