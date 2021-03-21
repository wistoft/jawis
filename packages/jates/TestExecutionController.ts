import path from "path";

import { assertNever, def, Waiter, LoopController, timeRace } from "^jab";

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
import { TestLogController } from "./TestLogController";

// prov

export type TestExecutionControllerProv = {
  isRunning: () => void;
  onToggleRunning: () => void;
};

//deps

export type TestExecutionControllerDeps = {
  absTestFolder: string;
  timeoutms: number;
  tr: TestRunner;
  tlc: TestLogController;
  onRogueTest: OnRogue;
  onError: (error: unknown) => void;
  onTestResult: OnTestResult;
} & Pick<
  ClientComProv,
  "onTestStarts" | "onTestRunnerStarts" | "onTestRunnerStops"
>;

type States =
  | "idle"
  | "running"
  | "pausing"
  | "pausing-newTests"
  | "paused"
  | "stopping"
  | "done";

type Events = "exec-done" | "test-done";

/**
 * Runs an ordered test selection.
 *
 *  - Handle a new test list at any time.
 *  - Support pause and resume.
 *  - Emit events for test start/stop.
 *  - Emit events for test execution start/stop.
 *  - Know nothing of the test framework practicalities, or how the test list is constructed
 *  - When new tests are set, when paused/pausing, the execution starts.
 *
 * todo
 *  - what to do about shutdown
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
      stoppingState: "stopping",
      endState: "done",
    });
  }

  /**
   *
   */
  public isRunning = () =>
    this.waiter.is("running") ||
    this.waiter.is("pausing") ||
    this.waiter.is("pausing-newTests");

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
  public resume = () => {
    const state = this.waiter.getState();

    switch (state) {
      case "pausing":
        def(this.lc).resume();
        this.waiter.set("running");
        return;

      case "paused":
        this.startRunning();
        return;

      case "idle":
      case "running":
      case "pausing-newTests":
        //nothing to do
        return;

      case "stopping":
      case "done":
        throw new Error("Not active.");

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
      case "pausing-newTests":
        this.waiter.set("pausing");
        return;

      case "running":
        this.waiter.set("pausing");
        def(this.lc).pause().then(this.onPaused).catch(this.deps.onError);
        return;

      case "idle":
        this.waiter.set("paused");
        return;

      case "pausing":
      case "paused":
        //nothing to do
        return;

      case "stopping":
      case "done":
        throw new Error("Not active.");

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
      case "pausing-newTests":
        this.startRunning();
        return;

      case "pausing":
        this.waiter.set("paused");
        return;

      case "running":
      case "paused":
      case "idle":
        throw new Error("Impossbile: " + state);

      case "stopping":
      case "done":
        throw new Error("Not active.");

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
        //pause and fall through. Let the pause-logic startup
        //  with the new test list, when execution has "stopped".
        //Is this to hacky?
        this.pause();

      //fall through

      case "pausing-newTests":
      case "pausing":
        this.prepareLc(ids);
        this.waiter.set("pausing-newTests");
        return;

      case "paused":
      case "idle":
        this.startRunningHelper(ids);
        return;

      case "stopping":
      case "done":
        throw new Error("Not active.");

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  private startRunningHelper = (ids: string[]) => {
    this.deps.onTestRunnerStarts();
    this.prepareLc(ids);
    this.startRunning();
  };

  /**
   * LC must be ready. But unstarted is okay.
   */
  private startRunning = () => {
    this.waiter.set("running");

    def(this.lc).resume(); //resume covers both start and resume. While start only is allowed for unstarted looper.
  };

  /**
   *
   */
  private prepareLc = (ids: string[]) => {
    this.lc = new LoopController<string>({
      arr: ids,
      makePromise: this.runNextTest,
      onError: this.deps.onError,
      autoStart: false,
    });

    this.lc.getPromise().then(this.onLoopDone);
  };

  /**
   * - note: we may not always reach this, because a new test list, will leave the old unresolved.
   */
  private onLoopDone = () => {
    const state = this.waiter.getState();

    switch (state) {
      case "running":
        this.waiter.set("idle");
        this.deps.onTestRunnerStops();
        this.waiter.event("exec-done");
        return;

      case "pausing-newTests":
      case "pausing":
        //Impossible because LoopController only resolves the pause-promise.
        throw new Error("Impossible: " + state);

      case "paused":
      case "idle":
      case "stopping":
      case "done":
        throw new Error("Impossble: " + state);

      default:
        return assertNever(state);
    }
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
        const state = this.waiter.getState();

        switch (state) {
          case "pausing-newTests":
          case "pausing":
          case "running":
            this.deps.onTestResult(id, result);

            this.waiter.event("test-done");
            return;

          case "paused":
          case "idle":
          case "stopping":
          case "done":
            throw new Error("Impossble: " + state);

          default:
            return assertNever(state);
        }
      });
  };
}
