import { tos } from "^jab";
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Context,
  Test,
  Reporter,
  ReporterOnStartOptions,
} from "@jest/reporters";
import type {
  AggregatedResult,
  TestCaseResult,
  TestResult,
} from "@jest/test-result";

const verbose = false;

/**
 * Prints nothing. It's just for squashing stdout.
 */
class MyCustomReporter implements Reporter {
  private _error?: Error;

  onRunStart(
    _result: AggregatedResult,
    _options: ReporterOnStartOptions
  ): void {
    verbose && console.log("onRunStart");
  }

  onTestStart(test: Test): void {
    verbose && console.log("onTestStart", test.path);
  }

  //testCaseResult just contains stack, og error object.
  onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
    verbose && console.log("onTestCaseResult");
    verbose && console.log(tos({ ...test, context: "removed" }));

    //`testCaseResult.failureDetails` contains snapshots, that don't match.

    verbose && console.log(tos(testCaseResult));
  }

  onTestResult(
    test: Test,
    testResult: TestResult,
    aggregatedResults: AggregatedResult
  ): void {
    verbose && console.log("onTestResult");
    verbose && console.log(tos({ ...test, context: "removed" }));
    verbose && console.log(tos(testResult));
    verbose && console.log(tos(aggregatedResults));
  }

  onRunComplete(contexts: Set<Context>, results: AggregatedResult) {
    verbose && console.log("onRunComplete");
    verbose && console.log(tos(contexts));
    verbose && console.log(tos(results));
  }

  //seems a way to report errors occurred in the reporting process.
  getLastError(): Error | undefined {
    verbose && console.log("getLastError", this._error);
    return this._error;
  }
}

module.exports = MyCustomReporter;
