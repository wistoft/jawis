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

import { basename, JabError, prej, tos } from "^jab";
import { makePrefixCode } from "^jab-node";

import {
  dianosticToString,
  getTsPathsConfig,
  getTsConfigFromAbsConfigFile,
} from ".";
import { CompileService } from "./types";

export type SourceFileLoaderDeps = {
  lazyRequire: boolean;
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
  public load = (absScriptPath: string) => {
    if (!path.isAbsolute(absScriptPath)) {
      return prej("absScriptPath must be absolute");
    }

    const cachedData = this.cache.get(absScriptPath);

    if (cachedData) {
      return Promise.resolve(cachedData);
    }

    return fs.promises.readFile(absScriptPath).then((indata) => {
      this.watcher.add(absScriptPath);

      const raw = this.getCompilerOptions(absScriptPath);

      //overwrite some of the parameters.

      const compilerOptions: CompilerOptions = {
        ...raw,
        module: ModuleKind.CommonJS,
        inlineSourceMap: true,
      };

      //something fucks up for .ts files, when jsx is set.

      if (absScriptPath.endsWith(".ts")) {
        delete compilerOptions.jsx;
      }

      //add lazy loading

      const source = this.deps.lazyRequire
        ? SourceFileLoader.prefix + indata.toString()
        : indata.toString();

      // transpile

      //todo: shouldn't compile .js files?
      const compiledSource = this.transpile(source, {
        fileName: basename(absScriptPath),
        compilerOptions,
      });

      // cache

      this.cache.set(absScriptPath, compiledSource);

      return compiledSource;
    });
  };

  /**
   *
   */
  public transpile = (data: string, options: TranspileOptions) => {
    const result = transpileModule(data, options);

    if (result.diagnostics && result.diagnostics.length > 0) {
      throw new JabError(
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
  public getCompilerOptions = (absScriptPath: string) => {
    const file = this.getConfFile(absScriptPath);

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
  public getConfFile = (absScriptPath: string) => {
    const dir = path.normalize(path.dirname(absScriptPath));

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
  public getTsConfigPaths = (absScriptPath: string) => {
    const file = this.getConfFile(absScriptPath);

    if (file === null) {
      return undefined;
    }

    const options = this.getCompilerOptions(absScriptPath);

    return getTsPathsConfig(options, file);
  };
}
