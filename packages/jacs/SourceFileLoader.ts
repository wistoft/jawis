import path from "path";
import fs from "fs";
import filewatcher from "filewatcher";
import {
  CompilerOptions,
  findConfigFile,
  ModuleKind,
  sys,
  transpileModule,
  TranspileOptions,
} from "typescript";

import { makePrefixCode } from "^lazy-require-ts";
import { basename, CompileService, err, prej, tos } from "^jab";

import {
  dianosticToString,
  getTsPathsConfig,
  getTsConfigFromAbsConfigFile,
} from "^ts-config-util";

export type SourceFileLoaderDeps = {
  experimentalLazyRequire?: boolean;
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

  /**
   *
   */
  constructor(private deps: SourceFileLoaderDeps) {
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
      return prej("absScriptPath must be absolute");
    }

    const cachedData = this.cache.get(absFile);

    if (cachedData) {
      return Promise.resolve(cachedData);
    }

    return fs.promises.readFile(absFile).then((indata) => {
      this.watcher.add(absFile);

      const raw = this.getCompilerOptions(absFile);

      //something fucks up for .ts files, when jsx is set.

      const compilerOptions: CompilerOptions = {
        ...raw,
        module: ModuleKind.CommonJS,
        inlineSourceMap: true,
      };

      if (absFile.endsWith(".ts")) {
        delete compilerOptions.jsx;
      }

      //add lazy loading

      const source = this.deps.experimentalLazyRequire
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

    const conf = getTsConfigFromAbsConfigFile(file);

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
      //we have to used null, because undefined means no cache entry.
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
