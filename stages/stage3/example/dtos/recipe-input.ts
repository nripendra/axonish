import { InputType, Field, ID, Int } from "type-graphql";
import { Recipe } from "./recipe";
@InputType()
export class RecipeInput extends Recipe {
  @Field(type => ID)
  id: string = "";

  @Field()
  title: string = "";

  @Field(type => [Int])
  ratings: number[] = [];

  @Field({ nullable: true })
  averageRating?: number;
}
