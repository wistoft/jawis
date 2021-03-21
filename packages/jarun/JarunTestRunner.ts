import {
  JabError,
  timeRace,
  asyncClone,
  clone,
  ClonedValue,
  tryProp,
} from "^jab";
import {
  OnRogue,
  TestResult,
  addReturnToTestLogs,
  errMsgAndReturnToTestLog,
  errorToTestLog,
} from "^jatec";

import {
  createJarunSetTimeout,
  MakeTestCase,
  TestFunction,
  awaitPromises,
} from "./util";
import { JarunTestProvision } from "./JarunTestProvision";
import { createJarunPromise } from "./JarunPromise";

export type JarunTestRunnerDeps = Readonly<{
  timeoutms: number;
  onRogueTest: OnRogue;
}>;

/**
 * Run Jarun test cases.
 *
 * - Runs one test case at a time.
 * - Tests can 'declare' promises
 *    - Returned promises from test function. Including promises in nested array/object structures.
 *    - Promises added to `await`
 *    - Implicit promises from calling `res` or `rej`
 * - Tests is defined to have ended, when the test function returns and its promises have resolved.
 * - Tests that execute something after it has ended are considered rogue.
 * - Tests can do async clean up after test has ended.
 *      Except:
 *      - Use of test provision is disallowed.
 *      - Exceptions/rejections are considered rogue.
 *
 * impl
 *  - Create a test provision for the test case.
 *  - capture console and place it in test logs.
 *  - Intercept promise rejects and execeptions in setTimeout.
 *      - to determine where uh-exceptions comes from
 *      - to determine if a exception/rejection is rogue.
 *  - clone the value returned from test function.
 *  - await declared promises.
 *  - run finally functions.
 *  - deactivate test provision, so rogue tests can be caught.
 */
export class JarunTestRunner {
  private currentProv?: JarunTestProvision;

  public orgPromise: PromiseConstructor;
  public orgSetTimeout: typeof setTimeout;

  constructor(private deps: JarunTestRunnerDeps) {
    //save for use later.
    this.orgPromise = global.Promise;
    this.orgSetTimeout = global.setTimeout;
  }

  /**
   *
   */
  public runTest = (
    testId: string,
    makeTest: MakeTestCase
  ): Promise<TestResult> => {
    const prov = new JarunTestProvision({
      testId,
      onRogueTest: this.deps.onRogueTest,
    });

    this.currentProv = prov;

    return this.wrapWithSafeAsync(prov, () =>
      this.wrapWithConsole(prov, () => this.runTestFile(testId, makeTest, prov))
    )
      .finally(() => {
        prov.active = false;
        this.currentProv = undefined;
      })
      .then((info) => ({
        cur: addReturnToTestLogs(prov.logs, info.testReturn),
        execTime: info.execTime,
        requireTime: info.requireTime,
      }));
  };

  /**
   *
   */
  private wrapWithSafeAsync = <T>(
    prov: JarunTestProvision,
    work: () => Promise<T>
  ) => {
    const jarunPromise = createJarunPromise(prov);
    const jarunSetTimeout = createJarunSetTimeout(prov, global.setTimeout);

    if (global.Promise !== this.orgPromise) {
      global.Promise = this.orgPromise; //reset
      throw new Error("global.Promise was been changed (before test)");
    }

    if (global.setTimeout !== this.orgSetTimeout) {
      global.setTimeout = this.orgSetTimeout; //reset
      throw new Error("global.setTimeout was been changed (before test)");
    }

    global.Promise = jarunPromise;
    global.setTimeout = jarunSetTimeout as any; //fix the missing __promisify__

    return work().finally(() => {
      if (jarunPromise !== global.Promise) {
        prov.onError(
          new Error("global.Promise was been changed (during test)")
        );
      }

      if (jarunSetTimeout !== global.setTimeout) {
        prov.onError(
          new Error("global.setTimeout was been changed (during test)")
        );
      }

      global.Promise = this.orgPromise;
      global.setTimeout = this.orgSetTimeout;
    });
  };

  /**
   *
   */
  private wrapWithConsole = <T>(
    prov: JarunTestProvision,
    work: () => Promise<T>
  ) => {
    const orgLog = console.log;
    const orgError = console.error;

    console.log = (...args: any[]) => {
      prov.log("console.log", ...args);
    };
    console.error = (...args: any[]) => {
      prov.log("console.error", ...args);
    };

    return work().finally(() => {
      console.log = orgLog;
      console.error = orgError;
    });
  };

  /**
   *
   * impl
   *  - load and interpret test export.
   *  - run finally functions
   *  - wait for declared promises.
   */
  public runTestFile = (
    testId: string,
    makeTest: MakeTestCase,
    prov: JarunTestProvision
  ): Promise<{
    testReturn: ClonedValue | undefined;
    execTime?: number;
    requireTime?: number;
  }> =>
    Promise.resolve().then(() => {
      const requireStartTime = Date.now();

      let testMod;

      try {
        testMod = makeTest();

        if (typeof testMod !== "function") {
          throw new JabError("Unknown default-export from test case.", testMod);
        }
      } catch (e) {
        prov.onError(e);
        return { testReturn: undefined }; // Resolve as if test returned undefined.
      }

      const testStartTime = Date.now();

      return this.runTestAndClone(testId, testMod, prov)
        .catch(prov.onError) // handles sync throw in the test. Resolve as if test returned undefined.
        .finally(prov.runFinally)
        .finally(() => awaitPromises(prov))
        .then((testReturn) => {
          const now = Date.now();
          return {
            testReturn,
            execTime: now - testStartTime,
            requireTime: now - requireStartTime,
          };
        });
    });

  /**
   *
   * impl
   *  - call test function
   *  - clone returned value.
   */
  public runTestAndClone = (
    testId: string,
    func: TestFunction,
    prov: JarunTestProvision
  ): Promise<ClonedValue | undefined> =>
    Promise.resolve().then(() => {
      const res = func(prov);

      if (res instanceof this.orgPromise) {
        return this.wrapSinglePromise(testId, res).then(cloneTestReturn);
      } else if (res === undefined) {
        return;
      } else {
        return asyncClone(
          res,
          this.deps.timeoutms,
          (updatedCloned, type) => {
            this.deps.onRogueTest({
              id: testId,
              data: errMsgAndReturnToTestLog(
                "Test " + type + " after timeout.",
                updatedCloned
              ),
            });
          },
          prov.onError,
          undefined,
          undefined,
          this.orgPromise //hacky. Men Promise is not instanceof JaurnPromise, so it would otherwise be overlooked
        );
      }
    });

  /**
   *
   *
   */
  private wrapSinglePromise = (testId: string, promise: Promise<unknown>) => {
    const fallback = (prom: Promise<unknown>) =>
      prom
        .then((testReturn: unknown) => {
          this.deps.onRogueTest({
            id: testId,
            data: errMsgAndReturnToTestLog(
              "Test resolved after timeout.",
              cloneTestReturn(testReturn)
            ),
          });
        })
        .catch((error: unknown) => {
          this.deps.onRogueTest({
            id: testId,
            data: errorToTestLog(error, [], "Test rejected after timeout."),
          });
        });

    return timeRace(
      promise,
      fallback,
      this.deps.timeoutms,
      "Test timeout (" + this.deps.timeoutms + "ms)"
    );
  };

  /**
   *
   */
  public handleUhException = (error: unknown, type: string) => {
    //marked, so we can let test provision handle it.

    const errorJtp = tryProp<JarunTestProvision>(error, "_jarunTestProvision");

    if (errorJtp) {
      errorJtp.onError(error, [type]);
      return;
    }

    //regard it as rogue, when no testId. e.g. `fs.fileRead`

    const info = this.currentProv
      ? [
          type,
          "Thrown while this test executed: " + this.currentProv.getTestId(),
        ]
      : [type];

    //bug: this message could reach client before TestResult.

    this.deps.onRogueTest({
      data: errorToTestLog(error, info),
    });
  };
}

//
// util
//

const cloneTestReturn = (testReturn: unknown): ClonedValue | undefined => {
  if (testReturn !== undefined) {
    return clone(testReturn);
  }
};
