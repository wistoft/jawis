import path from "node:path";
import ts, {
  CompilerOptions,
  EmitAndSemanticDiagnosticsBuilderProgram,
  Program,
} from "typescript";

import { CompileService, prej, pres } from "^jab";

import { getTsCompileHost } from ".";

type Deps = {
  options: CompilerOptions;
  onTsError: () => void;
};

/**
 * Using `ts.createEmitAndSemanticDiagnosticsBuilderProgram`. Typescript caches everything.
 *
 * - Serve load requests if source code type-checks, otherwise reject with the type error.
 * - Handle when files change
 * - Always emits errors to the stream, even while processing a load request.
 *
 * see
 *  - https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 *  - https://github.com/Microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json
 *  - https://basarat.gitbook.io/typescript/overview
 *  - https://github.com/microsoft/TypeScript-Compiler-Notes/tree/main/intro
 *      - many notes
 *  - https://ts-ast-viewer.com/
 *
 * language service api
 *  - https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API
 *  - https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin
 *
 * todo
 *  - handle root names deleted.
 */
export class TsCompileServiceIncremental implements CompileService {
  private host: ts.CompilerHost;
  private output: { [_: string | number]: string };
  private builder?: EmitAndSemanticDiagnosticsBuilderProgram;
  private program?: Program;
  private rootNames: string[] = [];
  private rootNamesSet: Set<string> = new Set(); //to avoid searching the array all the time.

  /**
   *
   */
  constructor(private deps: Deps) {
    const { host, output } = getTsCompileHost({
      options: deps.options,
      // debug: console.log,
      host: ts.createIncrementalCompilerHost(this.deps.options),
    });

    this.host = host;
    this.output = output;
  }

  /**
   * todo
   *  - handle file delete. rootNames must be updated.
   */
  public onFileChange = (_file: string) => {
    this.program = undefined; //simple :)
  };

  /**
   *
   */
  public load = (absFile: string) => {
    if (!path.isAbsolute(absFile)) {
      return prej("absScriptPath must be absolute: " + absFile);
    }

    //compile

    const program = this.getProgram(absFile);

    const diag = ts.getPreEmitDiagnostics(program);

    if (diag.length !== 0) {
      //emit errors

      const msg = ts.formatDiagnostics(diag, this.host);

      return prej("Compile error:\n" + msg);
    } else {
      //emit code

      //todo: it takes a `writeFile`, so we don't need the output hack
      program.emit();

      const emitFile = absFile.replace(/\\/g, "/").replace(/.tsx?$/, ".js");

      //fetch from in memory store

      return pres(this.output[emitFile]);
    }
  };

  /**
   *
   */
  private getProgram = (absFile: string) => {
    //reuse old program, if files haven't changed.

    if (this.program !== undefined) {
      return this.program;
    }

    //update root names

    if (!this.rootNamesSet.has(absFile)) {
      this.rootNamesSet.add(absFile);
      this.rootNames.push(absFile);
    }

    //make/update builder

    //alternative: createSemanticDiagnosticsBuilderProgram
    this.builder = ts.createEmitAndSemanticDiagnosticsBuilderProgram(
      this.rootNames,
      this.deps.options,
      this.host,
      this.builder
    );

    //make program

    this.program = this.builder.getProgram();

    return this.program;
  };
}
