import path from "path";

import {
  assertNever,
  def,
  Waiter,
  LoopController,
  timeRace,
  assert,
} from "^jab";

import {
  OnRogue,
  errorToTestLog,
  addErrMsgToTestLog,
  TestResult,
  errorToTestResult,
  OnTestResult,
} from "^jatec";

import { TestRunner } from ".";
import { ClientComProv } from "./ClientComController";

// prov

export type TestExecutionControllerProv = {
  isRunning: () => void;
  onToggleRunning: () => void;
  prependTestList: (ids: string[]) => void;
};

//deps

export type TestExecutionControllerDeps = {
  absTestFolder: string;
  timeoutms: number;
  tr: TestRunner;
  onRogueTest: OnRogue;
  onError: (error: unknown) => void;
  onTestResult: OnTestResult;
} & Pick<
  ClientComProv,
  "onTestStarts" | "onTestRunnerStarts" | "onTestRunnerStops"
>;

type States = "idle" | "running" | "paused";

type Events = "exec-done" | "test-done";

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
  public waiter: Waiter<States, Events>;

  public lc?: LoopController<string>;

  /**
   *
   */
  constructor(private deps: TestExecutionControllerDeps) {
    this.waiter = new Waiter<States, Events>({
      onError: this.deps.onError,
      startState: "idle",
    });
  }

  /**
   *
   */
  public isRunning = () => this.waiter.is("running");

  /**
   *
   */
  public onToggleRunning = () => {
    if (this.isRunning()) {
      this.pause();
    } else {
      this.resume();
    }
  };

  /**
   *
   */
  private startWithNewLC = (ids: string[]) => {
    this.deps.onTestRunnerStarts();
    this.prepareLc(ids);
    this.enterRunningState();
  };

  /**
   * LC must be ready. But unstarted is okay.
   */
  private enterRunningState = () => {
    this.waiter.set("running");
    def(this.lc).resume();
  };

  /**
   *
   */
  private prepareLc = (ids: string[]) => {
    this.lc = new LoopController<string>({
      initialArray: ids,
      makePromise: this.runNextTest,
      onError: this.deps.onError,
      autoStart: false,
    });

    this.lc.getPromise().then(this.onLoopDone);
  };

  /**
   *
   */
  public resume = () => {
    const state = this.waiter.getState();

    switch (state) {
      case "paused":
        this.deps.onTestRunnerStarts();
        this.enterRunningState();
        return;

      case "running":
        def(this.lc).resume(); //no need, but no harm
        return;

      case "idle":
        //nothing to do
        return;

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  public pause = () => {
    const state = this.waiter.getState();

    switch (state) {
      case "running":
        def(this.lc).pause().then(this.onPaused).catch(this.deps.onError);
        return;

      case "idle":
        this.waiter.set("paused");
        return;

      case "paused":
        //nothing to do
        return;

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  private onPaused = (lcState: "paused" | "cancelled") => {
    if (lcState === "cancelled") {
      return;
    }

    const state = this.waiter.getState();

    switch (state) {
      case "running":
        this.deps.onTestRunnerStops();
        this.waiter.set("paused");
        return;

      case "paused":
        //nothing to do, but happens several pause commands are received before paused.
        return;

      case "idle":
        throw new Error("Impossbile: " + state);

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  public prependTestList = (ids: string[]) => {
    const state = this.waiter.getState();

    switch (state) {
      case "running":
        def(this.lc).prependArray(ids);
        def(this.lc).resume(); // to cancel possible pause-commands in progress.
        return;

      case "paused":
        def(this.lc).prependArray(ids);

        //start
        this.deps.onTestRunnerStarts();
        this.enterRunningState();
        return;

      case "idle":
        this.startWithNewLC(ids);
        return;

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  public setTestList = (ids: string[]) => {
    const state = this.waiter.getState();

    switch (state) {
      case "running":
        def(this.lc).setArray(ids);
        def(this.lc).resume(); // to cancel possible pause-commands in progress.
        return;

      case "paused":
      case "idle":
        this.startWithNewLC(ids);
        return;

      default:
        return assertNever(state);
    }
  };

  /**
   * - note: we may not always reach this, because a new test list, will leave the old loop unresolved.
   */
  private onLoopDone = () => {
    assert(this.waiter.is("running"));

    this.waiter.set("idle");
    this.deps.onTestRunnerStops();
    this.waiter.event("exec-done");
  };

  /**
   * Handles test frameworks, that fail (so the errors emitted here are system/internal errors.)
   *
   * - Sets timeout for the test framework.
   * - Reports test resolve/reject after timeout as rogue.
   */
  private wrapRunTest = (id: string) => {
    const fallback = (prom: Promise<TestResult>) =>
      prom
        .then((testLogs) => {
          this.deps.onRogueTest({
            id,
            data: addErrMsgToTestLog(
              testLogs.cur,
              "Test resolved after timeout (in TEC)."
            ),
          });
        })
        .catch((error: unknown) => {
          this.deps.onRogueTest({
            id,
            data: errorToTestLog(
              error,
              [],
              "Test rejected after timeout (in TEC)."
            ),
          });
        });

    return timeRace(
      this.deps.tr.runTest(id, path.join(this.deps.absTestFolder, id)),
      fallback,
      this.deps.timeoutms,
      "Test timeout (" + this.deps.timeoutms + "ms) in TEC"
    );
  };

  /**
   * - Guard against wrapRunTest throws sync.
   * - Add timeout rejections to the test log.
   *    They may be user or internal errors. Impossible to tell the difference.
   *      e.g. user error to do 'loop infinity', or sync execute beyond timeout. The framework can't do anything about it.
   *        It can't interrupt. Which is also the reason for the timeout here.
   *      e.g. internal error if the framework forget to send `testDone`. And a million other things.
   */
  private runNextTest = (id: string) => {
    this.deps.onTestStarts(id);

    return Promise.resolve()
      .then(() => this.wrapRunTest(id))
      .catch(errorToTestResult)
      .then((result) => {
        assert(this.waiter.is("running"));

        this.deps.onTestResult(id, result);

        this.waiter.event("test-done");
      });
  };
}
