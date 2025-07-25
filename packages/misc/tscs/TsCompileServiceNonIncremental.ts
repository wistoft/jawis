import path from "node:path";
import ts, { CompilerOptions, Program } from "typescript";

import { CompileService, prej, pres } from "^jab";

import { getTsCompileHost } from ".";

type Deps = {
  options: CompilerOptions;
  onTsError: () => void;
};

/**
 * Using `ts.createProgram`. Typescript caches nothing.
 *
 * - Serve load requests if source code type-checks, otherwise reject with the type error.
 * - Handle when files change
 * - Always emits errors to the stream, even while processing a load request.
 *
 * todo
 *  - handle root names deleted.
 */
export class TsCompileServiceNonIncremental implements CompileService {
  private host: ts.CompilerHost;
  private output: { [_: string | number]: string };
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
   * - Remake program if root names increase
   */
  private getProgram = (absFile: string) => {
    //check program has absFile in root names

    if (!this.rootNamesSet.has(absFile)) {
      this.program = undefined;
    }

    //reuse old program, if files haven't changed.

    if (this.program !== undefined) {
      return this.program;
    }

    //update root names

    this.rootNamesSet.add(absFile);
    this.rootNames.push(absFile);

    //make program

    //todo: this can take `oldProgram`, does it mean it can do incremental?
    this.program = ts.createProgram({
      options: this.deps.options,
      rootNames: this.rootNames,
      host: this.host,
    });

    return this.program;
  };
}
