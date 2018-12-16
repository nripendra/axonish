The default convention for graphql is now to use type-graphql resolvers. The resolvers should be placed in a folder named "resolvers",
and should end with `.resolver.ts` or `.resolver.js` extension. The example again shows same example as stage1, but this time we removed
the code that builds the graphql schema. The schema should be built and loaded automagically. However, once should also notice that, we
have now renamed the file`recipe-resolver.ts` to `recipe.resolver.ts` so as to follow the convention.
