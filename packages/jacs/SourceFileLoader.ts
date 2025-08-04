import path from "node:path";
import fs from "node:fs";
import filewatcher from "filewatcher";
import ts, {
  CompilerOptions,
  findConfigFile,
  ModuleKind,
  sys,
  transpileModule,
  TranspileOptions,
} from "typescript";

import {
  CompileService,
  assert,
  assertNever,
  basename,
  err,
  prej,
  tos,
} from "^jab";
import { makeIndexFilePostfixCode, makePrefixCode } from "^lazy-require-ts";
import {
  dianosticToString,
  getTsPathsConfig,
  getTsConfigFromAbsConfigFile,
} from "^ts-config-util";

export type SourceFileLoaderDeps = {
  lazyRequire: boolean;
  lazyRequireIndexFiles: boolean;
  module: "commonjs" | "esm";
  onError: (error: unknown) => void;
};

/**
 * - Load source files and transpile them.
 * - Lookup config file relative to source file. I.e. support multiple projects.
 * - Cache config files.
 * - Cache config file lookup
 *
 * todo
 *  watch conf files
 *  watch lookup pathes, so we can detect new config files, and invalidate transpile results.
 *  way to send errors back to the running process.
 */
export class SourceFileLoader implements CompileService {
  private watcher: any;

  //contains the transpiled code.
  private cache: Map<string, string> = new Map();

  //contains the conf file path for a specific directory.
  // null means no conf file in the directory, or its parents.
  private confLookupCache: Map<string, string | null> = new Map();

  //contains the loaded configuration files.
  private confCache: Map<string, CompilerOptions> = new Map();

  private static prefix = makePrefixCode();
  private static prefixIndexFile = makeIndexFilePostfixCode();

  /**
   *
   */
  constructor(private deps: SourceFileLoaderDeps) {
    //checks

    if (deps.module === "esm" && deps.lazyRequire === true) {
      throw new Error("lazy require not supported for ECMAScript modules.");
    }

    //watcher

    this.watcher = filewatcher();

    this.watcher.on("change", (file: string) => {
      this.cache.delete(file);
    });

    this.watcher.on("fallback", () => {
      this.deps.onError(new Error("filewatcher fallback"));
    });
  }

  /**
   * Returns the transpiled code.
   *
   * - Output commonjs modules (silently overwrite config from tsconfig.json)
   * - Include inline source map. (silently overwrite config from tsconfig.json)
   */
  public load = (absFile: string) => {
    if (!path.isAbsolute(absFile)) {
      return prej("absFile must be absolute: " + absFile);
    }

    const cachedData = this.cache.get(absFile);

    if (cachedData) {
      return Promise.resolve(cachedData);
    }

    return fs.promises.readFile(absFile).then((indata) => {
      this.watcher.add(absFile);

      if (this.deps.lazyRequireIndexFiles && absFile.endsWith("index.ts")) {
        assert(this.deps.lazyRequire, "only implemented for lazy");

        const compiledSource =
          this.transpileIndexFile(indata.toString(), path.dirname(absFile)) +
          SourceFileLoader.prefixIndexFile;

        this.cache.set(absFile, compiledSource);

        return compiledSource;
      }

      const raw = this.getCompilerOptions(absFile);

      //overwrite some of the parameters.

      let module;

      switch (this.deps.module) {
        case "commonjs":
          module = ModuleKind.CommonJS;
          break;

        case "esm":
          module = ModuleKind.ESNext;

          break;

        default:
          return assertNever(this.deps.module);
      }

      const compilerOptions: CompilerOptions = {
        ...raw,
        module,
        inlineSourceMap: true,
      };

      //something fucks up for .ts files, when jsx is set.

      if (absFile.endsWith(".ts")) {
        delete compilerOptions.jsx;
      }

      //add lazy loading

      const source = this.deps.lazyRequire
        ? SourceFileLoader.prefix + indata.toString()
        : indata.toString();

      // transpile

      //shouldn't compile .js files?
      const compiledSource = this.transpile(source, {
        fileName: basename(absFile),
        compilerOptions,
      });

      // cache

      this.cache.set(absFile, compiledSource);

      return compiledSource;
    });
  };

  /**
   *
   * All lines must be on the form:
   *    export * from "./internal";
   */
  public transpileIndexFile = (data: string, folder: string) => {
    const units = data
      .replace(/\r/g, "")
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const match = line.match(
          /^\s*export\s+\*\s+from\s+"\.\/([^"]+)"\s*(;\s*)?$/
        );

        if (match === null) {
          throw new Error("All lines in index file must be on the required form."); // prettier-ignore
        }

        const absFile = path.join(folder, match[1] + ".ts");

        // const content = fs.readFileSync(absFile);

        const exports: string[] = ["todo-extract-exports"];

        return { absFile, exports };
      })
      .reduce<[string, string][]>((acc, cur) => {
        // map each export/unit to its file
        const mapped: [string, string][] = cur.exports.map((ex) => [
          ex,
          cur.absFile,
        ]);

        return [...acc, ...mapped];
      }, []);

    return "const units = new Map(" + JSON.stringify(units) + ");\n";
  };

  /**
   *
   */
  public transpile = (data: string, options: TranspileOptions) => {
    const result = transpileModule(data, options);

    if (result.diagnostics && result.diagnostics.length > 0) {
      throw err(
        "Could not transpile: " + dianosticToString(result.diagnostics),
        tos(result.diagnostics)
      );
    } else {
      return result.outputText;
    }
  };

  /**
   *
   */
  public getCompilerOptions = (absFile: string) => {
    const file = this.getConfFile(absFile);

    if (file === null) {
      return {};
    }

    const cachedConf = this.confCache.get(file);

    if (cachedConf) {
      return cachedConf;
    }

    const conf = getTsConfigFromAbsConfigFile(ts, file) as ts.CompilerOptions;

    this.confCache.set(file, conf);

    return conf;
  };

  /**
   * Get abs config file path.
   *
   * - Return `null` means no conf for that script.
   *
   * todo
   *  maybe better normalize to ensure consistent cache key.
   */
  public getConfFile = (absFile: string) => {
    const dir = path.normalize(path.dirname(absFile));

    const cachedConfPath = this.confLookupCache.get(dir);

    if (cachedConfPath !== undefined) {
      return cachedConfPath;
    }

    const filesLookedAt = [] as string[];

    const fileExists = (path: string) => {
      filesLookedAt.push(path);
      return sys.fileExists(path);
    };

    const res = findConfigFile(dir, fileExists);

    filesLookedAt.forEach((file) => {
      //we have to use null, because undefined means no cache entry.
      this.confLookupCache.set(
        path.normalize(path.dirname(file)),
        res === undefined ? null : res
      );
    });

    return res === undefined ? null : res;
  };

  /**
   *
   */
  public getTsConfigPaths = (absFile: string) => {
    const file = this.getConfFile(absFile);

    if (file === null) {
      return;
    }

    const options = this.getCompilerOptions(absFile);

    return getTsPathsConfig(options, file);
  };
}
