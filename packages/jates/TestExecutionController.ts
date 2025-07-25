import { timeRace } from "^yapu";
import { LoopController } from "^loop-controller";

import {
  OnRogue,
  errorToTestLog,
  addErrMsgToTestLog,
  TestResult,
  errorToTestResult,
  OnTestResult,
  ComposedTestFrameworkProv,
  ClientComProv,
} from "./internal";

// prov

export type TestExecutionControllerProv = {
  onToggleRunning: () => void;
  prependTestList: (ids: string[]) => void;
};

//deps

export type TestExecutionControllerDeps = {
  timeoutms: number;
  testFramework: ComposedTestFrameworkProv;
  onRogueTest: OnRogue;
  onError: (error: unknown) => void;
  onTestResult: OnTestResult;

  //for testing

  DateNow: () => number;
} & Pick<
  ClientComProv,
  "onTestStarts" | "onTestRunnerStarts" | "onTestRunnerStops"
>;

/**
 * Runs an ordered list of test.
 *
 *  - Handle a new test list at any time.
 *  - Support pause and resume.
 *  - Emit events for test start/stop.
 *  - Emit events for test execution start/stop.
 *  - Know nothing of the test framework practicalities, or how the test list is constructed
 *  - When new tests are set, when paused/pausing, the execution starts.
 *
 */
export class TestExecutionController implements TestExecutionControllerProv {
  public lc: LoopController<string>;

  /**
   *
   */
  constructor(private deps: TestExecutionControllerDeps) {
    this.lc = new LoopController<string>({
      initialArray: [],
      makePromise: this.runNextTest,
      onError: this.deps.onError,
      autoStart: false,
      onStart: () => this.deps.onTestRunnerStarts(),
      onStop: () => this.deps.onTestRunnerStops(),
    });
  }

  /**
   *
   */
  public onToggleRunning = () => {
    if (this.lc.isRunning()) {
      this.pause();
    } else {
      this.resume();
    }
  };

  /**
   *
   */
  public resume = () => this.lc.resume();

  /**
   *
   */
  public pause = () => this.lc.pause();

  /**
   *
   */
  public prependTestList = (ids: string[]) => {
    this.lc.prependArray(ids);
    this.lc.resume();
  };

  /**
   *
   */
  public setTestList = (ids: string[]) => {
    this.lc.setArray(ids);
    this.lc.resume();
  };

  /**
   * Handles test frameworks, that fail (so the errors emitted here are system/internal errors.)
   *
   * - Sets timeout for the test framework.
   * - Reports test resolve/reject after timeout as rogue.
   * - No robustness. `runNextTest` handles that.
   */
  private wrapRunTest = (id: string) => {
    const startTime = this.deps.DateNow();

    const fallback = (prom: Promise<TestResult>) =>
      prom
        .then((testLogs) => {
          this.deps.onRogueTest({
            id,
            data: addErrMsgToTestLog(
              testLogs.cur,
              "Test resolved after timeout (in TEC).",
              [{ time: this.deps.DateNow() - startTime }]
            ),
          });
        })
        .catch((error: unknown) => {
          this.deps.onRogueTest({
            id,
            data: errorToTestLog(
              error,
              [{ time: this.deps.DateNow() - startTime }],
              "Test rejected after timeout (in TEC)."
            ),
          });
        });

    return timeRace(
      this.deps.testFramework.runTest(id),
      fallback,
      this.deps.timeoutms,
      "Test timeout (" + this.deps.timeoutms + "ms) in TEC"
    );
  };

  /**
   * - Pause execution, if errors are thrown. They are internal errors.
   * - Guard against wrapRunTest throws sync.
   * - Add timeout rejections to the test log.
   *    They may be user or internal errors. Impossible to tell the difference.
   *      e.g. user error to do 'loop infinity', or sync execute beyond timeout. The framework can't do anything about it.
   *        It can't interrupt. Which is also the reason for the timeout here.
   *      e.g. internal error if the framework forget to send `testDone`. And a million other things.
   * - Doesn't wait for onTestResult to finish, but starts next test right away. onTestResult does async work.
   */
  private runNextTest = (id: string) => {
    this.deps.onTestStarts(id);

    return Promise.resolve()
      .then(() => this.wrapRunTest(id))
      .catch((error) => {
        this.pause();

        return errorToTestResult(error);
      })
      .then((result) => {
        this.deps.onTestResult(id, result);
      });
  };
}
