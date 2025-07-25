import fs from "node:fs";
import path from "node:path";
import escapeStringRegexp from "escape-string-regexp";
import Mocha, { MochaOptions, Runner } from "mocha";

import { AbsoluteFile, pres, unknownToErrorData } from "^jab";
import {
  addErrorToTestResult,
  TestInfo,
  NoopTestLogController,
  TestFrameworkProv,
  TestResult,
} from "^jatec";
import { clearModuleCache } from "^node-module-hooks-plus";
import { getPromise } from "^yapu";

type TestFrameworkDeps = {
  absTestFolder: string;
};

/**
 *
 * can't do the same logic as the CLI, because those functions aren't exported.
 *  it does:
 *        lib/cli/options.js#loadOptions
 *        lib/cli/collect-files.js#collectFiles
 */
export class MochaAdapter implements TestFrameworkProv {
  public testLogController = new NoopTestLogController();

  constructor(private deps: TestFrameworkDeps) {}

  /**
   * Tests are loaded by doing a dry run.
   *
   * todo: cache the discovered tests, and watch files for change to avoid a lot of work.
   *
   */
  public getTestInfo = async () => {
    const deps: ReporterDeps = {} as any;

    await this.runMocha({
      dryRun: true,
      reporter: makeMyReporter(deps),
    });

    return deps.output.seenTestIds;
  };

  /**
   *
   */
  public getCurrentSelectionTestInfo = async () => [];

  /**
   *
   */
  public runTest = async (globalId: string, testName: string) => {
    const deps: ReporterDeps = {} as any;

    await this.runMocha({
      reporter: makeMyReporter(deps),
      grep: new RegExp("^" + escapeStringRegexp(testName) + "$"),
    });

    if (deps.output.testResult.length === 0) {
      throw new Error("No test results from mocha.");
    }

    if (deps.output.testResult.length === 1) {
      return deps.output.testResult[0];
    } else {
      return addErrorToTestResult(
        deps.output.testResult[0],
        new Error("More than one test case with this test id.")
      );
    }
  };

  /**
   *
   * - this only works once per process, if clearModuleCache isn't called. But it is.
   *
   * todo: take an option to reduce/filter files to run, so unneeded files aren't loaded.
   * todo: must set options.isWorker to the right value.
   */
  private runMocha = (options: Mocha.MochaOptions) => {
    const prom = getPromise<void>();

    const mocha = new Mocha(options);

    //quick fix
    mocha.files = fs
      .readdirSync(this.deps.absTestFolder)
      .filter((file) => file.substr(-3) === ".js")
      .map((file) => path.join(this.deps.absTestFolder, file));

    //needed, because mocha depends on test cases calling functions at load, and that will only happen first time.
    // and we have thrown the old Mocha instance away.
    clearModuleCache(mocha.files);

    //don't care about failures, they are listed in the result.
    mocha.run(() => {
      prom.resolve();
      mocha.dispose();
    });

    return prom.promise;
  };

  /**
   *
   */
  public kill = () => {
    console.log("mocha kill not impl.");
    return pres(undefined);
  };
}

//
// util
//

type ReporterDeps = {
  output: {
    seenTestIds: TestInfo[];
    testResult: TestResult[];
  };
};

/**
 *
 * - Mocha contructs the class, so we need a hack to get access to the data it produces.
 */
const makeMyReporter = (deps: ReporterDeps) =>
  class MyReporter extends Mocha.reporters.Base {
    constructor(runner: Runner, options: MochaOptions) {
      super(runner, options);

      deps.output = {
        seenTestIds: [],
        testResult: [],
      };

      runner.on("test end", (test) => {
        if (test.file === undefined) {
          throw new Error("How can a mocha test have undefined file?");
        }

        deps.output.seenTestIds.push({
          id: test.fullTitle(),
          name: test.fullTitle(),
          file: test.file as AbsoluteFile,
        });

        const result: TestResult = {
          execTime: test.duration,
          cur: {
            user: {},
          },
        };

        if (test.err) {
          //todo: make strictEqual into check log.
          result.cur.err = [unknownToErrorData(test.err)];
        }

        deps.output.testResult.push(result);
      });
    }
  };
