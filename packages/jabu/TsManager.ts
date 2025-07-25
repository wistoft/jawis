import ts, { CompilerOptions } from "typescript";

import { AbsoluteFile } from "^jab";
import {
  getAbsConfigFilePath,
  getTsConfigFromAbsConfigFile,
} from "^ts-config-util";

import {
  TsManagerHostDeps,
  TsManagerHost,
  DiagnosticWithoutFile,
} from "./internal";

type Deps = {
  folder: string; //does this make sense?
  options?: CompilerOptions;
} & Omit<TsManagerHostDeps, "options">;

/**
 *
 *
 * impl
 *  - use `ts.createLanguageService`. Typescript caches everything.
 *  - it's a problem, that ts expects sync fs functions.
 *      - But we could fail on request for unknown things, and then restart, when we have the information.
 *      - TypeScript had a function, that could tell which files it will need. So we could preload.
 *
 * see
 *  - https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API
 *  - https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin
 *
 */
export class TsManager {
  private service: ts.LanguageService;
  private host: TsManagerHost;

  /**
   *
   */
  constructor(private deps: Deps) {
    //options

    const options = deps.options ?? this.getOptions(deps.folder);

    //host

    this.host = new TsManagerHost({
      ...deps,
      options,
    });

    const registry = ts.createDocumentRegistry();

    this.service = ts.createLanguageService(this.host, registry);
  }

  /**
   *
   * note
   *  - content isn't needed, we can get it form jabu file system.
   */
  public getDiagnostics = (file: AbsoluteFile): DiagnosticWithoutFile[] => {
    const diag = this.getDiagHelper(file);

    //return

    return diag.map((diagnostic: any): DiagnosticWithoutFile => {
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );

      if (diagnostic.file) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);

        return {
          message,
          line: line + 1,
          column: character + 1,
        };
      } else {
        return {
          message,
        };
      }
    });
  };

  /**
   * Return some diagnostics, if some exists.
   *
   * - All diagnostics are not necessarily returned.
   * - Return general diagnostics first.
   */
  private getDiagHelper = (canonicalFile: string) => {
    const opt = this.service.getCompilerOptionsDiagnostics();

    if (opt.length !== 0) {
      return opt;
    }

    const synt = this.service.getSyntacticDiagnostics(canonicalFile);

    if (synt.length !== 0) {
      return synt;
    }

    return this.service.getSemanticDiagnostics(canonicalFile);
  };

  /**
   *
   */
  private getOptions = (folder: string) => {
    const confFile = getAbsConfigFilePath(ts, folder);

    return getTsConfigFromAbsConfigFile(ts, confFile);
  };
}
