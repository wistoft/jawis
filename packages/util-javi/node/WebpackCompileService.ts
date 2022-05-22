import path from "path";

import { createFsFromVolume, Volume } from "memfs";
import webpack from "webpack";
import stripAnsi from "strip-ansi";

import {
  cloneArrayEntries,
  ClonedValue,
  def,
  err,
  ErrorData,
  getPromise,
  ParsedStackFrame,
  PromiseTriple,
  unknownToErrorData,
} from "^jab";

import { CompileService, getAbsConfigFilePath } from "^jacs";
import { getWebpackResolve, getWebpackTSRules } from ".";

type Deps = {
  projectRoot: string;
  onError: (error: unknown) => void;
};

/**
 *
 * todo
 *  - handle concurrent requests.
 *  - webpack compiler foreach tsconfig.json
 */
export class WebpackCompileService implements CompileService {
  private absFile?: string;
  private prom?: PromiseTriple<string>;
  private watcher?: webpack.Watching;
  private fs?: any;

  /**
   *
   */
  constructor(private deps: Deps) {}

  /**
   *
   */
  public load = (relFile: string) => {
    if (this.absFile) {
      throw err("The absFile should not be set.", this.absFile);
    }

    this.absFile = path.join(this.deps.projectRoot, relFile);

    this.prom = getPromise<string>();

    this.getWatcher().invalidate();

    return this.prom.promise;
  };

  /**
   * also get warnings.
   */
  public watchDone = (error?: Error | null, stats?: webpack.Stats) => {
    if (!this.absFile) {
      throw err("The absFile should be set.");
    }

    this.absFile = undefined;

    if (error) {
      def(this.prom).reject(error);
    } else if (stats && stats.hasErrors()) {
      const { errorsAsJson, quickFixMessage } = mapWebpackErrors(
        stats.compilation.errors,
        stats.compilation.moduleGraph
      );

      const errors = errorsAsJson.join(",");

      const message = JSON.stringify(
        "AggragateError:\n" + quickFixMessage.join("\n")
      );

      //uses the BeeHive convention. I.e.: QUICK_FIX

      def(this.prom).resolve(
        `QUICK_FIX = {message:${message}, getAggregateErrors: () => [${errors}]}`
      );
    } else {
      //catch errors during load, and store in global scope for Beehive.

      const prepend = "try{";
      const append = "}catch(err){QUICK_FIX = err;}";
      const mapStart = ";\n//# sourceMappingURL";

      let code = prepend + this.fs.readFileSync("./dist/main.js").toString();

      code = code.replace(mapStart, append + mapStart);

      def(this.prom).resolve(code);
    }
  };

  /**
   *
   * - must be lazily created, because it starts compilation right away. And we don't have an entry, before load is called.
   */
  public getWatcher = () => {
    if (this.watcher) {
      return this.watcher;
    }

    const volumn = new Volume();

    this.fs = createFsFromVolume(volumn);

    const tsConfigFile = getAbsConfigFilePath(this.deps.projectRoot);

    const compiler = webpack({
      mode: "development",

      stats: "errors-only", //has no effect.

      entry: () => {
        if (!this.absFile) {
          throw new Error("The absFile should be set.");
        }

        return {
          main: this.absFile,
        };
      },

      resolve: getWebpackResolve(tsConfigFile),

      module: {
        rules: getWebpackTSRules(tsConfigFile),
      },

      devtool: "inline-cheap-module-source-map",
    });

    compiler.outputFileSystem = this.fs as any;

    compiler.hooks.invalid.tap("WebpackCompileService", () => {
      // console.log("invalid");
    });

    //should we use these options: compiler.options.watchOptions

    this.watcher = compiler.watch({}, this.watchDone);

    return this.watcher;
  };
}

//
// util
//

/**
 *
 */
const mapWebpackErrors = (
  errors: webpack.WebpackError[],
  moduleGraph: webpack.ModuleGraph
) => {
  const quickFixMessage: string[] = [];

  //uses ErrorData convention.
  const errorsAsJson = errors.map((error) => {
    const { msg, info, stack } = mapWebpackError(error, moduleGraph);

    //extra debug infos
    const allInfo: ClonedValue[] = [...cloneArrayEntries([]), ...info];

    quickFixMessage.push(msg);

    return `{msg:${JSON.stringify(msg)}, info:${JSON.stringify(
      allInfo
    )}, stack:${JSON.stringify(stack)}}`;
  });

  return { errorsAsJson, quickFixMessage };
};

/**
 *
 */
const filterWebpackErrorMessage = (message: string, file: string) =>
  stripAnsi(message)
    .replace("[tsl] ERROR in " + file, "")

    //for "Module not found" errors, that used to be polyfilled.
    .replace(
      /BREAKING CHANGE: webpack[^]*resolve\.fallback: \{ ".*": false \}\s*/,
      ""
    )
    .replace(/^\(\d+,\d+\)\r?\n\s*/, "");

/**
 *
 */
const mapWebpackError = (
  error: webpack.WebpackError,
  moduleGraph: webpack.ModuleGraph
): ErrorData => {
  //for parse error

  if (error.name === "ModuleParseError" && !error.file) {
    return {
      msg: filterWebpackErrorMessage(error.message, error.file),
      info: [],
      stack: unknownToErrorData((error as any).error).stack,
    };
  }

  //for module not found error

  if (error.name === "ModuleNotFoundError" && !error.file) {
    return mapModuleNotFound(error, moduleGraph);
  }

  //the file might be a source position

  if (error.file) {
    return {
      msg: filterWebpackErrorMessage(error.message, error.file),
      info: [],
      stack: {
        type: "node-parsed",
        stack: [
          {
            line: (error as any)?.loc?.start?.line,
            file: error.file,
          },
        ],
      },
    };
  }

  //fallback to show webpack's stack trace

  return {
    msg: filterWebpackErrorMessage(error.message, error.file),
    info: [],
    stack: unknownToErrorData(error).stack,
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
 * impl
 *  - Can't get better type for the error, than `WebpackError`.
 *  - We could get the webpack error stack as additional information from: `error.error.stack`
 */
const mapModuleNotFound = (
  error: webpack.WebpackError,
  moduleGraph: webpack.ModuleGraph
): ErrorData => {
  //stack frame for the module with error

  const match = error.message.match(/Can't resolve '([^']*)'/);

  const requiredModule = match ? match[1] : undefined;

  //typing is wrong. module can be null.
  if (!error.module) {
    //extract webpackErrorToErrorData
    // og dedup.
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

  const info: ClonedValue[] = [];

  return {
    msg: `Module: '${requiredModule}' not found in ${file}`,
    info,
    stack: {
      type: "node-parsed",
      stack: [errorModuleStackframe, ...originModuleTrace],
    },
  };
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
//
