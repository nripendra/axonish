import { Resolver, Query, Arg } from "type-graphql";
import { Recipe } from "../dtos/recipe";
import { promises } from "fs";

@Resolver(of => Recipe)
export class RecipeResolver {
  private readonly items: Recipe[] = [
    {
      title: "Recipe 1",
      ratings: [0, 3, 1],
      id: "1"
    },
    {
      title: "Recipe 2",
      id: "2",
      ratings: [4, 2, 3, 1]
    },
    {
      title: "Recipe 3",
      id: "3",
      ratings: [5, 4]
    }
  ];

  @Query(returns => Recipe, { nullable: true })
  async recipe(@Arg("title") title: string): Promise<Recipe | undefined> {
    return await Promise.resolve(
      this.items.find(recipe => recipe.title === title)
    );
  }

  @Query(returns => [Recipe])
  async recipes(): Promise<Recipe[]> {
    return await Promise.resolve(this.items);
  }
}
