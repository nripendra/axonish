import { ObjectType, Field, ID, Int } from "type-graphql";
@ObjectType()
export class Recipe {
  @Field(type => ID)
  id: string = "";

  @Field()
  title: string = "";

  @Field(type => [Int])
  ratings: number[] = [];

  @Field({ nullable: true })
  averageRating?: number;
}
