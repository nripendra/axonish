Now we have added ability to provide own schema. For that purpose, we have added a new method in `IApiConfiguration` interface named
`setSchema`. Since my overarching goal is to use type-graphql for defining the graphql schema, this example shows how it can be achieved
right now. At this stage, we can build schema using type-graphql's `buildSchema` function, and pass that schema to the setSchema method.

Our config function should look like this:

```ts
@AxonishApi()
export class MyShopApiGateWay implements IApiStartup {
  async config(appConfig: IApiConfiguration): Promise<void> {
    const schema = await buildSchema({
      resolvers: [__dirname + "/resolvers/recipe-resolver.ts"]
    });
    appConfig.setSchema(schema);
  }
  //... rest of the methods
}
```

This is pretty simple configuration, but a developer will have to type this boiler-plate code on every project. Thus, we'd have some
built-in convention such that, the convention itself will do exactly this for the developer. At this stage, a "convention" for me, is a
function that takes in the instance of the `IApiConfiguration` as a parameter and sets default values. Now, this architecture also
means a developer can write his/her own convention. Furthermore, probably into far future we can have a special folder where developer 
is supposed to put all convention function and all those will be picked up automatically? Aha! a convention for conventions :P
