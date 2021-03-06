import { IApiConfiguration } from "../interfaces/IApiConfiguration";
import { buildSchema } from "type-graphql";
import * as path from "path";
import * as Glob from "glob";

let _defaultResolverDiscoveryPaths = ["**/resolvers/*.resolver.{js,ts}"];
let _defaultAuthCheckerDiscoveryPath = "**/auth-checker.{js,ts}";
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

  const authCheckerPath = Glob.sync(
    _defaultAuthCheckerDiscoveryPath,
    _defaultOptions
  )[0];

  const authChecker: any = authCheckerPath
    ? require(pathResolve(_defaultOptions.cwd!, authCheckerPath)).default
    : undefined;

  if (files.length > 0) {
    try {
      const schema = await buildSchema({
        authChecker,
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

export function setGlobOptions(options: {
  cwd?: string;
  ignore?: string | string[];
}) {
  if (options) {
    _defaultOptions = options;
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

let rootDir = "";
export function getRootDir() {
  return rootDir;
}

export function __InjectRootDir(dir: string): void {
  rootDir = dir;
}
