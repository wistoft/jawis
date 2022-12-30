import deepEqual from "deep-equal";

import { OnRogue, TestCurLogs, errorToTestLog } from "^jates";
import {
  assert,
  capture,
  def,
  err,
  tryProp,
  unknownToErrorData,
  OnError,
} from "^jab";

import { FinallyFunc } from "^finally-provider";
import { looping } from "^yapu";
import { JarunEqAssertation } from "./internal";

export type TestProvision = {
  chk: (val: unknown) => void;
  eq: (exp: unknown, cur: unknown) => void;
  neq: (exp: unknown, cur: unknown) => void;
  imp: (...val: unknown[]) => void;
  div: (...val: unknown[]) => void;
  log: (logName: string, ...value: unknown[]) => void;
  logStream: (logName: string, value: string) => void;
  onError: OnError;
  catch: <T>(func: () => T) => T | undefined;
  filter: (logName: string, func: (...val: unknown[]) => unknown[]) => void;
  finally: FinallyFunc;
  await: (prom: Promise<unknown>) => Promise<unknown>;
  res: (exp: unknown, prom: Promise<unknown>) => Promise<void>;
  rej: (exp: unknown, prom: Promise<unknown>) => Promise<void>;
};

type Deps = {
  testId: string;
  onRogueTest: OnRogue;
};

/**
 * Provision given to each test case.
 *
 * - All logged values are cloned, so mutating them afterwards is no problem.
 *
 * impl
 *  - throw for most functions, throw when test has ended.
 *  - onError sends rogue message, if test has ended.
 */
export class JarunTestProvision implements TestProvision {
  public active = true;

  public logs: TestCurLogs = { user: {} };

  private finallyFuncs: Array<() => void | undefined | Promise<void>> = [];

  private filterFuncs: Map<string, (...val: unknown[]) => unknown[]> =
    new Map();

  //cleared from outside, during await phase.
  public awaitPromises: Promise<unknown>[] = [];

  constructor(private deps: Deps) {}

  /**
   *
   */
  public getTestId = () => this.deps.testId;

  /**
   * Assert a value is true.
   */
  public chk = (val: unknown) => {
    this.throwIfRogue();

    if (val === true) {
      return;
    } else {
      throw new JarunEqAssertation(true, val);
    }
  };

  /**
   * Assert two values are equal.
   */
  public eq = (exp: unknown, cur: unknown) => {
    this.throwIfRogue();

    if (!deepEqual(exp, cur, { strict: true })) {
      throw new JarunEqAssertation(exp, cur);
    }
  };

  /**
   * Assert two values are not equal.
   */
  public neq = (exp: unknown, cur: unknown) => {
    this.throwIfRogue();

    if (deepEqual(exp, cur, { strict: true })) {
      // quick fix
      throw new JarunEqAssertation(exp, cur);
    }
  };

  /**
   * Log a value to 'imp' log.
   */
  public imp = (...val: Array<unknown>) => {
    this.throwIfRogue();

    this.log("imp", ...val);
  };

  /**
   * Log a value to 'div' log.
   */
  public div = (...val: Array<unknown>) => {
    this.throwIfRogue();

    this.log("div", ...val);
  };

  /**
   * Check the reserved logs aren't used by the test case.
   */
  private logPreCheck = (logName: string) => {
    this.throwIfRogue();

    if (
      logName === "err" ||
      logName === "return" ||
      logName === "chk" ||
      logName === "stdout" ||
      logName === "stderr" ||
      logName === "internal"
    ) {
      err("Log name is preserved for special use: " + logName);
    }
  };

  /**
   * Log a value to a log chosen by the user.
   */
  public log = (logName: string, ...tmp: Array<unknown>) => {
    this.logPreCheck(logName);

    this.userLogHelper(logName, ...tmp);
  };

  /**
   * Log a value to a stream.
   *
   * - chucking of calls to this function has no significance.
   */
  public logStream = (logName: string, tmp: string | Buffer) => {
    if (typeof tmp === "string") {
      this.logStreamString(logName, tmp);
    } else if (tmp instanceof Buffer) {
      this.logStreamString(logName, tmp.toString());
    } else {
      err("logStream only supports string and Buffer.", tmp);
    }
  };

  /**
   * hacky implemented
   */
  private logStreamString = (logName: string, tmp: string) => {
    this.logPreCheck(logName);

    //filter

    const filter = this.filterFuncs.get(logName);

    const value = filter ? filter(tmp) : tmp;

    if (typeof value !== "string") {
      throw err("Filter should return a string.", value);
    }

    if (this.logs.user[logName] === undefined) {
      this.logs.user[logName] = [""];
    } else {
      if (def(this.logs.user[logName]).length !== 1) {
        err("logStream should have one entry.");
      }

      if (typeof def(this.logs.user[logName])[0] !== "string") {
        err("logStream should be a string.");
      }
    }

    const old = def(this.logs.user[logName])[0];

    this.logs.user[logName] = [old + value];
  };

  /**
   *
   * - Apply the filter to values.
   * - Clones values before they are stored.
   */
  private userLogHelper = (logName: string, ...tmp: Array<unknown>) => {
    this.throwIfRogue();

    const filter = this.filterFuncs.get(logName);

    let tmp2;
    if (filter) {
      tmp2 = filter(...tmp);
    } else {
      tmp2 = tmp;
    }

    tmp2.forEach((value) => {
      if (this.logs.user[logName] === undefined) {
        this.logs.user[logName] = [];
      }

      def(this.logs.user[logName]).push(capture(value));
    });
  };

  /**
   * - Rogue allowed, because we need a way to report those errors.
   * - no motivation to handle rogue chk logs specially.
   * - Explicit return type: undefined. It's a stronger guarantee, than void.
   */
  public onError = (error: unknown, extraInfo?: Array<unknown>): undefined => {
    const name = tryProp(error, "name");

    if (name === "JarunEqAssertation") {
      assert(this.active, "Congratulations, rare race condition.");
      assert(this.logs.chk === undefined, "not supported: multiple chk logs.");

      this.logs["chk"] = (error as JarunEqAssertation).getSomething();
    } else {
      if (this.active) {
        if (this.logs["err"] === undefined) {
          this.logs["err"] = [];
        }

        this.logs["err"].push(unknownToErrorData(error, extraInfo));
      } else {
        this.deps.onRogueTest({
          id: this.deps.testId,
          data: errorToTestLog(error, extraInfo),
        });
      }
    }

    return; // for typescript.
  };

  /**
   * Add a filter function, that is applied to all logged values.
   */
  public filter = (logName: string, func: (val: unknown) => unknown[]) => {
    this.throwIfRogue();

    this.filterFuncs.set(logName, func);
  };

  /**
   * Add a finally function, that is executed after the test case has run.
   */
  public finally = (func: () => void | undefined | Promise<void>) => {
    this.throwIfRogue();

    this.finallyFuncs.push(func);
  };

  /**
   *
   * todo
   * - should not be here. JTR should do this.
   * - Could use Finally provider instead.
   */
  public runFinally = () =>
    looping(this.finallyFuncs, (finalTasks) =>
      Promise.resolve()
        .then(() => finalTasks())
        .catch((error: unknown) => {
          this.onError(error, ["Test finally threw."]);
        })
    );

  /**
   *
   */
  private throwIfRogue = () => {
    if (!this.active) {
      const error = new Error("Test has ended: " + this.deps.testId);

      // mark, so JTR can tell where the error comes from.
      (error as any)._jarunTestProvision = this;

      throw error;
    }
  };

  /**
   * Assert a function throws an error, and report the error.
   *
   * todo
   *  - throw, if no exception.
   *  - make this catch async as well.
   */
  public catch = <T>(func: () => T) => {
    this.throwIfRogue();

    try {
      return func();
    } catch (e) {
      this.onError(e);
    }
  };

  /**
   * The test won't end before the promise has settled.
   *
   * - The value from the promise isn't used for anything.
   * - There's no need to wait for the returned promise. It's just for convenience.
   */
  public await = <T>(prom: Promise<T>) => {
    this.throwIfRogue();

    this.awaitPromises.push(prom);

    return prom;
  };

  /**
   * Assert that the promise resolves to the expected value.
   *
   * - This allows concurrent assertations.
   * - Different from the async-await mechanism. That is for sequential assertations. But they are
   *    easier to use, if possible.
   * - It's not necessary to wait for the returned promise.
   */
  public res = (exp: unknown, prom: Promise<unknown>) =>
    this.await(
      prom.then((value) => {
        this.eq(exp, value);
      })
    );

  /**
   * Assert that the promise rejects to the expected error message.
   *
   * - It's not necessary to wait for the returned promise explicit.
   * - It's an error if the promise resolves to something.
   */
  public rej = (exp: unknown, prom: Promise<unknown>) =>
    this.await(
      prom.then(
        (cur) => {
          err("Expected rejection, but got:", cur);
        },
        (error) => {
          if (tryProp(error, "getErrorData")) {
            this.eq(exp, error.getErrorData().msg);
          } else if (tryProp(error, "message")) {
            this.eq(exp, error.message);
          } else {
            throw new Error("Unexpected error object.");
          }
        }
      )
    );
}
