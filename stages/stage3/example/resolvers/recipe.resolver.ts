import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { Recipe } from "../dtos/recipe";
import { promises } from "fs";
import { Inject } from "typedi";
import { MessageBusService } from "@axonish/core/src/tokens";
import IMessageBus from "@axonish/core/src/interfaces/IMessageBus";
import { FindAllRecipe } from "../queries/find-all";
import { FindRecipeByTitle } from "../queries/find-by-title";
import { RecipeInput } from "../dtos/recipe-input";
import { AddRecipe } from "../commands/add-recipe";

@Resolver(of => Recipe)
export class RecipeResolver {
  constructor(@Inject(MessageBusService) private _bus: IMessageBus) {}
  @Query(returns => Recipe, { nullable: true })
  async recipe(@Arg("title") title: string): Promise<Recipe | undefined> {
    return await this._bus
      .channel("Recipe-Service")
      .send(FindRecipeByTitle({ title }));
  }

  @Query(returns => [Recipe])
  async recipes(): Promise<Recipe[]> {
    return await this._bus.channel("Recipe-Service").send(FindAllRecipe());
  }

  @Mutation(returns => Recipe)
  async addRecipe(@Arg("input") recipe: RecipeInput): Promise<Recipe> {
    return await this._bus.channel("Recipe-Service").send(AddRecipe(recipe));
  }
}
