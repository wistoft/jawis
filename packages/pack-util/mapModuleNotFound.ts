import webpack from "webpack";

import {
  CapturedValue,
  ErrorData,
  ParsedStackFrame,
  unknownToErrorData,
} from "^jab";

import { CustomWebpackError, filterWebpackErrorMessage } from "./internal";

/**
 *
 */
export const mapModuleNotFound = (
  error: CustomWebpackError,
  moduleGraph: webpack.ModuleGraph
): ErrorData => {
  //stack frame for the module with error

  const match = error.message.match(/Can't resolve '([^']*)'/);

  const requiredModule = match ? match[1] : undefined;

  //typing is wrong. module can be null.
  if (!error.module) {
    //extract webpackErrorToErrorData
    // and dedup.
    return {
      msg: filterWebpackErrorMessage(error.message, error.file),
      info: [],
      stack: unknownToErrorData((error as any).error).stack,
    };
  }

  const maybeDep = error.module.dependencies.find(
    (dep: any) => dep.request === requiredModule
  );

  const file = getModuleSourceFile(error.module);

  const errorModuleStackframe = getCustomFrame(maybeDep, file);

  //trace for requiring modules

  const originModuleTrace = getModuleTrace(error.module, moduleGraph).map(
    (elm) => {
      const deps = Array.from(moduleGraph.getIncomingConnections(elm.module))
        .filter((c) => c.resolvedOriginModule === elm.origin)
        .map((c) => c.dependency);

      const maybeDep = deps.length > 0 ? deps[0] : undefined;

      return getCustomFrame(maybeDep, getModuleSourceFile(elm.origin));
    }
  );

  const info: CapturedValue[] = [];

  return {
    msg: `Module: '${requiredModule}' not found in ${file}`,
    info,
    stack: {
      type: "parsed",
      stack: [errorModuleStackframe, ...originModuleTrace],
    },
  };
};

/**
 *
 */
const getCustomFrame = (
  dep: webpack.Dependency | null | undefined,
  file: string | undefined
): ParsedStackFrame => ({
  func: `require('${(dep as any).userRequest}')` || "require",
  line: (dep as any)?.loc?.start?.line,
  file,
});

/**
 *
 * how to get the module's file
 *  - error.module.resource
 *  - error.module.userRequest
 *  - error.module.rawRequest
 *  - error.module.identifier()
 */
const getModuleSourceFile = (module: webpack.Module) => {
  const file = (module as any).resource;

  const guesses = [(module as any).userRequest];

  for (const guess of guesses) {
    if (guess !== file) {
      console.log(
        "getModuleSourceFile() - Some guess was wrong: ",
        file,
        guesses
      );
      break;
    }
  }

  return file;
};

/**
 * from: DefaultStatsFactoryPlugin.js
 */
const getModuleTrace = (
  module: webpack.Module,
  moduleGraph: webpack.ModuleGraph
) => {
  const visitedModules = new Set();
  const moduleTrace = [];
  let current = module;

  while (current) {
    if (visitedModules.has(current)) break; // circular (technically impossible, but who knows)
    visitedModules.add(current);
    const origin = moduleGraph.getIssuer(current);
    if (!origin) break;
    moduleTrace.push({ origin, module: current });
    current = origin;
  }

  return moduleTrace;
};
