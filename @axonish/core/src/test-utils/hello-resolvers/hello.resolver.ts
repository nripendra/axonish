import { Resolver, Query, Arg } from "type-graphql";

@Resolver(of => String)
export class HelloResolver {
  @Query(returns => String)
  async hello(@Arg("arg") arg: string): Promise<string> {
    return "Hello " + arg;
  }
}
