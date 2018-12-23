import * as path from "path";
import * as Glob from "glob";
import IServiceConfiguration from "../interfaces/IServiceConfiguration";

let _defaultDiscoveryPaths = [
  "**/read-model/*.{js,ts}",
  "**/write-model/*.{js,ts}"
];
let _defaultOptions: { cwd?: string; ignore?: string | string[] } = {
  cwd: path.resolve("."),
  ignore: ["**/**/*.d.ts", "**/**/*.map", "**/node_modules/", "**/dist/"]
};
const visitedGlobs: {
  [key: string]: string[];
} = {};

export async function directoryConvention(
  serviceConfig: IServiceConfiguration
) {
  const pathResolve = path.resolve;
  const files: string[] = _defaultDiscoveryPaths.flatMap(glob => {
    if (visitedGlobs[glob] === undefined) {
      visitedGlobs[glob] = Glob.sync(glob, _defaultOptions).map(x =>
        pathResolve(_defaultOptions.cwd!, x)
      );
    }
    return visitedGlobs[glob];
  });

  if (files.length > 0) {
    files.forEach(file => require(file));
  }
}

export function __ClearVisitedGlobsForUnitTest() {
  for (const key in visitedGlobs) {
    delete visitedGlobs[key];
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

export function __InjectConventionsForUnitTest(
  resolvers: string[],
  options?: { cwd?: string; ignore?: string | string[] }
): void {
  if (options) {
    _defaultOptions = options;
  }
  _defaultDiscoveryPaths = resolvers;
}

let rootDir = "";
export function getRootDir() {
  return rootDir;
}
export function __InjectRootDir(dir: string) {
  rootDir = dir;
}
