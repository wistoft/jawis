import path from "path";
import stripAnsi from "strip-ansi";
import escapeStringRegexp from "escape-string-regexp";

// eslint-disable-next-line import/no-extraneous-dependencies
import { runCLI } from "@jest/core";
// eslint-disable-next-line import/no-extraneous-dependencies
import { InitialOptions } from "@jest/types/build/Config";

import { ErrorData, hasProp, pres } from "^jab";
import {
  TestResult as JateTestResult,
  addErrorToTestResult,
  MinimalTestId,
  TestFrameworkProv,
} from "^jatec";

type TestFrameworkDeps = {
  absTestFolder: string;
};

/**
 *
 *
 * problems
 *  - console is squashed, because jest decorates console and still send to stdout. Test result has no entry with stdout.
 *  - uncaught handler isn't restored.
 *  - the first test snapshot is auto accepted
 *  - execTime reported for test cases isn't correct. The test suite introduces a lot of extra time.
 */
export class JestAdapter implements TestFrameworkProv<MinimalTestId> {
  constructor(private deps: TestFrameworkDeps) {}

  /**
   * - might be faster, than getTestIds.
   */
  public getTestFiles = () => this.runJest({ listTests: true });

  /**
   *
   * - Match nothing, so all tests are looped through, but none executed.
   */
  public getTestIds = () =>
    this.runJest({
      testNamePattern: /^$/,
      testLocationInResults: true,
    }).then((result) => {
      const tests: MinimalTestId[] = [];

      result.results.testResults.forEach((testFile) => {
        testFile.testResults.forEach((testCase) => {
          tests.push({
            name: testCase.fullName,
            file: testFile.testFilePath,
            line: testCase.location?.line,
          });
        });
      });

      return tests;
    });

  /**
   * - todo: filter by file also. To avoid duplicates in other files. And improve speed.
   */
  public runTest = (globalId: string, testId: MinimalTestId) =>
    this.runTestHelper({
      testNamePattern: new RegExp("^" + escapeStringRegexp(testId.name) + "$"),
    });

  /**
   * udgår
   */
  runTestHelper = (extra: Partial<Options>) =>
    this.runJest(extra).then((result) => {
      //get test data.

      const tests = [] as JateTestResult[];
      const testFileErrors = [] as ErrorData[];

      result.results.testResults.forEach((testFile) => {
        if (testFile.failureMessage) {
          testFileErrors.push(errorStackToErrorData(testFile.failureMessage));
        }

        testFile.testResults.forEach((testCase) => {
          if (testCase.status === "passed" || testCase.status === "failed") {
            const result: JateTestResult = {
              cur: {
                user: {},
              },
            };

            for (const details of testCase.failureDetails as any[]) {
              if (hasProp(details, "matcherResult")) {
                result.cur.user[details.matcherResult.name] = [
                  details.matcherResult.actual,
                ];
                result.cur.user[details.matcherResult.name + ".expected"] = [
                  details.matcherResult.expected,
                ];
              }
            }

            if (testCase.duration) {
              result.execTime = testCase.duration;
            }

            const errors = testCase.failureMessages
              .filter((str) => {
                //filter errors that are also in `failureDetails`
                for (const details of testCase.failureDetails) {
                  if (
                    hasProp(details, "matcherResult") &&
                    hasProp((details as any).matcherResult, "message") &&
                    str.includes((details as any).matcherResult.message)
                  ) {
                    //the error is already in the `failureDetails`
                    return false;
                  }
                }
                return true;
              })
              .map(errorStackToErrorData);

            if (errors.length > 0 || testFileErrors.length > 0) {
              //testFileErrors are duplicate here. Can we be certain of that?
              // result.cur.err = [...errors, ...testFileErrors];

              result.cur.err = errors;
            }

            tests.push(result);
          }
        });
      });

      //check, that there's only a single test result.

      if (tests.length === 0) {
        if (testFileErrors) {
          return {
            cur: {
              err: testFileErrors,
              user: {},
            },
          };
        }
        throw new Error("No test results from jest.");
      }

      if (tests.length === 1) {
        return tests[0];
      } else {
        return addErrorToTestResult(
          tests[0],
          new Error("More than one test case with this test id.")
        );
      }
    });

  /**
   *
   */
  private runJest = (extra: Partial<Options>) => {
    //the type in `runCLI` is to wide. (has string index signature.)
    const projects = [this.deps.absTestFolder];

    const options = {
      rootDir: this.deps.absTestFolder,
      passWithNoTests: true, //to avoid jest from callling `process.exit`
      runInBand: true,
      // runTestsByPath: true,

      //just used to suppress stdio from jest.
      reporters: [path.join(__dirname, "MyCustomReporter.ts")],

      ...extra,
    };

    return runCLI(options as any, projects).catch((error: any) => {
      if (error.message) {
        error.message = stripAnsi(error.message);
      }

      throw error;
    });
  };

  /**
   *
   */
  public kill = () => {
    console.log("jest kill not impl.");
    return pres(undefined);
  };
}

//
// util
//

//some dirty quick fix. That works.
//InitialOptions has more values.
type Options = InitialOptions | Partial<Argv>;

type Argv = {
  //doesn't have the string index signature.
  all: boolean;
  automock: boolean;
  bail: boolean | number;
  cache: boolean;
  cacheDirectory: string;
  changedFilesWithAncestor: boolean;
  changedSince: string;
  ci: boolean;
  clearCache: boolean;
  clearMocks: boolean;
  collectCoverage: boolean;
  collectCoverageFrom: string;
  collectCoverageOnlyFrom: Array<string>;
  color: boolean;
  colors: boolean;
  config: string;
  coverage: boolean;
  coverageDirectory: string;
  coveragePathIgnorePatterns: Array<string>;
  coverageReporters: Array<string>;
  coverageThreshold: string;
  debug: boolean;
  env: string;
  expand: boolean;
  findRelatedTests: boolean;
  forceExit: boolean;
  globals: string;
  globalSetup: string | null | undefined;
  globalTeardown: string | null | undefined;
  haste: string;
  init: boolean;
  injectGlobals: boolean;
  json: boolean;
  lastCommit: boolean;
  logHeapUsage: boolean;
  maxWorkers: number | string;
  moduleDirectories: Array<string>;
  moduleFileExtensions: Array<string>;
  moduleNameMapper: string;
  modulePathIgnorePatterns: Array<string>;
  modulePaths: Array<string>;
  noStackTrace: boolean;
  notify: boolean;
  notifyMode: string;
  onlyChanged: boolean;
  onlyFailures: boolean;
  outputFile: string;
  preset: string | null | undefined;
  projects: Array<string>;
  prettierPath: string | null | undefined;
  resetMocks: boolean;
  resetModules: boolean;
  resolver: string | null | undefined;
  restoreMocks: boolean;
  rootDir: string;
  roots: Array<string>;
  runInBand: boolean;
  selectProjects: Array<string>;
  setupFiles: Array<string>;
  setupFilesAfterEnv: Array<string>;
  showConfig: boolean;
  silent: boolean;
  snapshotSerializers: Array<string>;
  testEnvironment: string;
  testEnvironmentOptions: string;
  testFailureExitCode: string | null | undefined;
  testMatch: Array<string>;
  testNamePattern: string | RegExp; //denne tager nemlig også regexp.
  testPathIgnorePatterns: Array<string>;
  testPathPattern: Array<string>;
  testRegex: string | Array<string>;
  testResultsProcessor: string;
  testRunner: string;
  testSequencer: string;
  testURL: string;
  testTimeout: number | null | undefined;
  timers: string;
  transform: string;
  transformIgnorePatterns: Array<string>;
  unmockedModulePathPatterns: Array<string> | null | undefined;
  updateSnapshot: boolean;
  useStderr: boolean;
  verbose: boolean;
  version: boolean;
  watch: boolean;
  watchAll: boolean;
  watchman: boolean;
  watchPathIgnorePatterns: Array<string>;
};

/**
 * jest often just give the stack (with error message, as node does.)
 */
const errorStackToErrorData = (str: string): ErrorData => {
  const filteredMessage = stripAnsi(str)
    .replace(/^ {4} *at .*$/gm, "")
    .trim();

  return {
    msg: filteredMessage,
    info: [],
    stack: { type: "node", stack: stripAnsi(str) },
  };
};
