import path from "path";

import { dfs } from "^util/algs";

import { dtp } from "^util/dtp";

type Deps = {
  absTestFolder: string;
};

/**
 * superficially tested.
 *
 *
 * todo
 *  handling delete of test cases and modules.
 *  abs/rel files are annoying
 */
export class TestAnalytics {
  private exexTime: { [_: string]: number | undefined } = {};

  //to distinguish tests from source files. And make it easy to lookup a test's level.
  // -1 means valid. Number means level at which test was impacted. If invalid.

  public tests = new Map<string, number>();

  // holds both tests and source files.
  // reset each time impact is calculated, and the 'data' is transferred to `this.tests` and `cachedDtp`

  public changedFiles = new Set<string>();

  // cache previous impact
  // test level can be outdated here. The latest value is in `this.tests`.

  private cachedDtp: string[][] = [];

  // require graph

  private directRequired = new Map<string, Set<string>>();
  private directImpact = new Map<string, Set<string>>();

  /**
   *
   */
  constructor(private deps: Deps) {}

  /**
   *
   */
  public setTests = (relFiles: string[]) => {
    for (const relFile of relFiles) {
      const absFile = path.join(this.deps.absTestFolder, relFile);
      // console.log(this.deps.absTestFolder);
      // console.log("setTest: ", { relFile, absFile });
      this.setTest(absFile);
    }

    if (relFiles.length !== this.tests.size) {
      console.log(
        "setTest() - wrong number of tests",
        relFiles.length,
        this.tests.size
      );
      console.log({ relFiles, tests: this.tests });
    }
  };

  /**
   * not thought through
   *
   * - startLevel is the state test case are added as. Default is 'invalid test result'
   *
   * impl
   *  - careful not to reset the level registered in `this.tests`. I.e. set by `setTestValid`.
   */
  public setTest = (absFile: string, startLevel = 0) => {
    if (!this.tests.has(absFile)) {
      this.tests.set(absFile, startLevel);
      this.onChangedFile(absFile);
    }
  };

  /**
   * - testId is relative. Per convention.
   */
  public setTestValid = (testId: string) => {
    const absFile = path.join(this.deps.absTestFolder, testId);
    this.tests.set(absFile, -1);
  };

  /**
   * - Remove if it's a tests.
   */
  public onDeletedFile = (absFile: string) => {
    //remove it from list of tests
    // no effect, if it's a module.

    this.tests.delete(absFile);

    //ensure modules will impact tests.
    // no effect, if it's a test, because it's removed from `this.tests`, and not considered a test anymore.

    this.changedFiles.add(absFile);
  };

  /**
   *
   */
  public onChangedFile = (absFile: string) => {
    this.changedFiles.add(absFile);
  };

  /**
   *
   */
  public addDependency = (source: string, target: string) => {
    //require/dependency

    let ids = this.directRequired.get(source);

    if (!ids) {
      ids = new Set();
      this.directRequired.set(source, ids);
    }

    ids.add(target);

    //impact

    let impacts = this.directImpact.get(target);

    if (!impacts) {
      impacts = new Set();
      this.directImpact.set(target, impacts);
    }

    impacts.add(source);
  };

  /**
   *
   */
  public setTestExecTime = (testId: string, execTime: number | undefined) => {
    this.exexTime[testId] = execTime;
  };

  /**
   *
   * - if exec-time undefined test is but in front.
   */
  public sortTests = (tests: string[]): string[] =>
    [...tests].sort((a, b) => {
      const aTime = this.exexTime[a];
      const bTime = this.exexTime[b];

      if (aTime === undefined && bTime === undefined) {
        return a === b ? 0 : a < b ? -1 : 1;
      }

      if (aTime === undefined) {
        return -1; // a precedes
      }

      if (bTime === undefined) {
        return 1; // b precedes
      }

      return aTime - bTime;
    });

  /**
   *
   */
  public getDirectRequired = (id: string) => this.directRequired.get(id);

  /**
   * non-caching DFS.
   *
   */
  public getTransitiveRequired = (id: string) =>
    dfs(id, (id) => this.directRequired.get(id));

  /**
   *
   */
  public getImpact = () => {
    this.cachedDtp = dtp(
      this.cachedDtp,
      Array.from(this.changedFiles),
      this.deps.absTestFolder,
      this.tests,
      this.directImpact
    );

    this.changedFiles = new Set();

    return this.cachedDtp;
  };
}
