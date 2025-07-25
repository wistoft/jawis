import path from "node:path";
import webpack, { Compiler, WebpackPluginInstance, javascript } from "webpack";
import { createFsFromVolume, Volume } from "memfs";
import ts from "typescript";

import { assertNever, err, OnErrorData } from "^jab";
import { getPromise, PromiseTriple } from "^yapu";
import { getAbsConfigFilePath } from "^ts-config-util";

import {
  getWebpackResolve,
  getWebpackTSRules,
  mapWebpackError,
  mapWebpackErrors,
  State,
} from "./internal";

export type WebpackBatchCompilerDeps = {
  compileServiceRoot: string;
  config?: webpack.Configuration & {
    library?: Required<webpack.Configuration>["output"]["library"];
  };

  //some hacky stuff
  sendErrorsAsCode?: boolean;
  globalErrorCatchFix?: boolean;

  //quick fix - must be set when sendErrorsAsCode is false.
  onErrorData?: OnErrorData;
};

type Result = { absFile: string; code: string }[];

type States =
  | { type: "idle" }
  | {
      type: "compiling";
      absFiles: string[];
      prom: PromiseTriple<Result>;
      aliases: { [_: string]: string };
    };

/**
 *
 * - Cannot handle concurrent requests.
 * - Can only handle one tsconfig.json
 * - Can only handle one library output type
 *
 */
export class WebpackBatchCompiler {
  private watcher?: webpack.Watching;
  private fs?: any;

  private state: State<States>;

  /**
   *
   */
  constructor(private deps: WebpackBatchCompilerDeps) {
    this.state = new State<States>({
      startState: { type: "idle" },
    });
  }

  /**
   *
   */
  public loadMultiple = (absFiles: string[]) => {
    if (!this.state.is("idle")) {
      throw err("Already working.", this.state.getState());
    }

    for (const val of absFiles) {
      if (!path.isAbsolute(val)) {
        throw new Error("File must be absolute: " + absFiles);
      }
    }

    const prom = getPromise<Result>();

    this.state.set({
      type: "compiling",
      absFiles,
      prom,
      aliases: this.makeAliases(absFiles),
    });

    this.getWatcher().invalidate(); //start the compiler

    return prom.promise;
  };

  /**
   *
   */
  private makeAliases = (absFiles: string[]) => {
    let i = 1;

    const aliases: { [_: string]: string } = {};

    for (const absFile of absFiles) {
      aliases["file" + i++] = absFile;
    }

    return aliases;
  };

  /**
   * todo: also get warnings.
   */
  private compileDone = (error?: Error | null, stats?: webpack.Stats) => {
    const state = this.state.getState();

    switch (state.type) {
      case "idle":
        //this happens, when webpack detects a file change, after compile requests.

        //maybe we could ensure webpack pauses compiling, without pausing watching, by using these:

        // this.watcher.watcher?.pause()
        // this.watcher.suspend()
        break;

      case "compiling":
        {
          if (error) {
            //why not set QUICK_FIX here as well.
            state.prom.reject(error);
          } else if (stats && stats.hasErrors()) {
            this.handleWebpackError(state.absFiles, stats).then(
              state.prom.resolve,
              state.prom.reject
            );
          } else {
            state.prom.resolve(this.getCompiledFiles(state.aliases));
          }

          this.state.set({ type: "idle" });
        }
        break;

      default:
        return assertNever(state);
    }
  };

  /**
   *
   * - must be lazily created, because it starts compilation right away. And we don't have an entry, before load is called.
   */
  private getWatcher = () => {
    if (this.watcher) {
      return this.watcher;
    }

    const volumn = new Volume();

    this.fs = createFsFromVolume(volumn);

    const tsConfigFile = getAbsConfigFilePath(ts, this.deps.compileServiceRoot);

    const plugins = [];

    if (this.deps.config?.target === "node") {
      plugins.push(new MyPlugin());
    }

    const compilerOptions: any = {
      module: "esnext",
      //is this needed in typescript 5
      moduleResolution: "classic",
    };

    const library = this.deps.config?.library ?? {
      name: "QUICK_FIX_EXPORT",
      type: "assign",
    };

    const clone = { ...this.deps.config };

    delete clone["library"];

    const compiler = webpack({
      ...clone,

      mode: "development",

      stats: "errors-only", //has no effect.

      entry: () => this.state.getExpectedState("compiling").aliases,

      resolve: getWebpackResolve(tsConfigFile),

      module: {
        rules: getWebpackTSRules(tsConfigFile, compilerOptions),
      },

      devtool: "inline-cheap-module-source-map",

      plugins,

      output: {
        library,
      },
    });

    compiler.outputFileSystem = this.fs as any;

    this.watcher = compiler.watch({}, this.compileDone);

    return this.watcher;
  };

  /**
   *
   */
  private getCompiledFiles = (aliases: { [_: string]: string }) =>
    Object.entries(aliases).map(([alias, absFile]) => {
      //catch errors during load, and store in global scope for Beehive.
      let code = this.fs.readFileSync("./dist/" + alias + ".js").toString();

      if (!this.deps.globalErrorCatchFix) {
        return { absFile, code };
      } else {
        const prepend = "try{";
        const append = "}catch(err){global.QUICK_FIX = err;}";
        const mapStart = ";\n//# sourceMappingURL";

        code = prepend + code;

        code = code.replace(mapStart, append + mapStart);

        return { absFile, code };
      }
    });

  /**
   *
   */
  private handleWebpackError = async (
    absFiles: string[],
    stats: webpack.Stats
  ) => {
    if (this.deps.sendErrorsAsCode) {
      return this.getErrorsAsCode(absFiles, stats);
    } else {
      if (!this.deps.onErrorData) {
        throw new Error("onErrorData must be given as dep, when sendErrorsAsCode is false."); // prettier-ignore
      }

      for (const error of stats.compilation.errors) {
        const errorData = mapWebpackError(error, stats.compilation.moduleGraph);
        this.deps.onErrorData(errorData);
      }

      throw new Error("quick fix: errors reported to onErrorData");
    }
  };

  /**
   * Sends all errors to all requests
   *
   * todo: is it possible to partition errors by affected requests.
   */
  private getErrorsAsCode = (absFiles: string[], stats: webpack.Stats) => {
    const { errorsAsJson, quickFixMessage } = mapWebpackErrors(
      stats.compilation.errors,
      stats.compilation.moduleGraph
    );

    const errors = errorsAsJson.join(",");

    const message = JSON.stringify(
      "AggragateError:\n" + quickFixMessage.join("\n")
    );

    //uses the BeeHive convention. I.e.: QUICK_FIX

    return absFiles.map((absFile) => ({
      absFile,
      code: `global.QUICK_FIX = {message:${message}, getAggregateErrors: () => [${errors}]}`,
    }));
  };
}

class MyPlugin implements WebpackPluginInstance {
  /**
   *
   */
  public apply(compiler: Compiler) {
    compiler.hooks.normalModuleFactory.tap("MyPlugin", (factory) => {
      factory.hooks.parser.for("javascript/auto").tap("MyPlugin", this.hook);
    });
  }

  /**
   *
   * Related: webpack-ignore-dynamic-require
   */
  private hook = (parser: javascript.JavascriptParser) => {
    // bail expressions of `require.extensions`. Meaning webpack keeps the expression as is.
    parser.hooks.expression.for("require.extensions").tap("MyPlugin", () => {
      return true; // true for bail
    });

    // only bundle calls to require, if it's a literal specifier.
    parser.hooks.call.for("require").tap("MyPlugin", (expression) => {
      const args = expression.arguments;

      if (args.length === 1 && args[0].type === "Literal") {
        return; //do normal webpack bundling
      } else {
        return true; //leave call as is
      }
    });

    // bail expressions of `require.cache`. Meaning webpack keeps the expression as is.
    parser.hooks.expression.for("require.cache").tap("MyPlugin", () => {
      return true; // true for bail
    });
  };
}
