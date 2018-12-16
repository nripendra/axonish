import IApiConfiguration from "../interfaces/IApiConfiguration";
import { buildSchema } from "type-graphql";
import * as path from "path";
import * as Glob from "glob";

let _defaultResolverDiscoveryPaths = ["**/resolvers/*.resolver.{js,ts}"];
let _defaultOptions: { cwd?: string; ignore?: string | string[] } = {
  cwd: path.resolve("."),
  ignore: ["**/**/*.d.ts", "**/**/*.map", "**/node_modules/", "**/dist/"]
};
const visitedGlobs: {
  [key: string]: string[];
} = {};

export async function resolverConvention(apiConfig: IApiConfiguration) {
  const pathResolve = path.resolve;
  const files: string[] = _defaultResolverDiscoveryPaths.flatMap(glob => {
    if (visitedGlobs[glob] === undefined) {
      visitedGlobs[glob] = Glob.sync(glob, _defaultOptions).map(x =>
        pathResolve(_defaultOptions.cwd!, x)
      );
    }
    return visitedGlobs[glob];
  });

  if (files.length > 0) {
    try {
      const schema = await buildSchema({
        resolvers: files
      });
      apiConfig.setSchema(schema);
    } catch (e) {
      // Todo: distributed loging
      console.error(e);
      throw e;
    }
  }
}

export function __ClearVisitedGlobsForUnitTest() {
  for (const key in visitedGlobs) {
    delete visitedGlobs[key];
  }
}

export function __InjectConventionsForUnitTest(
  resolvers: string[],
  options?: { cwd?: string; ignore?: string | string[] }
): void {
  if (options) {
    _defaultOptions = options;
  }
  _defaultResolverDiscoveryPaths = resolvers;
}
