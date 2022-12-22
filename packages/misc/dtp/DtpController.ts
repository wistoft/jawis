import ts, { CompilerOptions } from "typescript";

import { DependencyGraph } from "./DependencyGraph";
import { extractDeps } from "./extractDeps";
import { dtp } from ".";

type Deps = {
  compilerHost: ts.CompilerHost;
  compilerOptions: CompilerOptions;
  absTestFolder: string;
};

/**
 *
 */
export class DtpController {
  private dtpGraph: DependencyGraph;

  private cachedDtp: string[][] = [];

  constructor(private deps: Deps) {
    this.dtpGraph = new DependencyGraph();
  }

  /**
   * Given the changed files, and the current test files, returns the tests in prioritized order.
   *
   * - If a test case is changed, it must also be in changedFiles.
   * - input files are absolute, returned files are relative to absTestFolder
   *
   * impl
   *  1. parse changed files
   *  2. update graph with changed dependencies.
   *  3. get tests from the graph using the standalone algorithm.
   */
  public getTests = (
    // eslint-disable-next-line unused-imports/no-unused-vars
    cachedDtp: string[][],
    // eslint-disable-next-line unused-imports/no-unused-vars
    changedFiles: string[],
    // eslint-disable-next-line unused-imports/no-unused-vars
    tests: Map<string, number>
  ) => {};

  /**
   * useful for testing
   */
  public getTests_pure = (
    cachedDtp: string[][],
    changedFiles: string[],
    tests: Map<string, number>
  ) => {
    changedFiles.forEach((file) => {
      const source = this.deps.compilerHost.readFile(file);

      if (!source) {
        throw new Error("File not found: " + file);
      }

      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.ES2015,
        /*setParentNodes */ false
      );

      //extract dependencies

      const info = extractDeps(
        sourceFile,
        this.deps.compilerOptions,
        this.deps.compilerHost
      );

      //clean the graph from old nodes from that file.

      // update graph

      this.dtpGraph.addInfo(info, file);
    });

    //prioritize

    return dtp(
      cachedDtp,
      Array.from(changedFiles),
      this.deps.absTestFolder,
      tests,
      new Map()
    );
  };
}
