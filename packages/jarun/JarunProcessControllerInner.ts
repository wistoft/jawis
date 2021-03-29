import {
  def,
  assert,
  assertNever,
  prej,
  getPromise,
  PromiseTriple,
  LogProv,
  Waiter,
  clone,
} from "^jab";
import { OnRequire, RequireSenderMessage } from "^jab-node";

import { OnRogue, TestResult } from "^jatec";

import { JarunProcessControllerMessage, JarunProcessMessage } from ".";

export type JarunProcessControllerInnerDeps = {
  onRogueTest: OnRogue;
  onRequire: OnRequire;

  //for sending to ProcessRestarter, that is assumed to 'lie' below this.
  prSend: (msg: JarunProcessControllerMessage) => Promise<void>;
  onError: (error: unknown) => void;
  logProv: LogProv;
};

type States = "ready" | "testing" | "error";
type Events = "restarted";

/**
 * Ensures tests has run on a non-changing codebase.
 *
 * - Send test cases and receive results when there're executed.
 * - Restart test cases, if the process was restarted.
 * - Partition stdout per test cases. When nothing is running send stdout to logProv. (Same for stderr)
 */
export class JarunProcessControllerInner {
  public waiter: Waiter<States, Events>;

  private curTestId?: string;
  private curTest?: string;
  private curStdout = "";
  private curStderr = "";

  private testProm?: PromiseTriple<TestResult>;

  /**
   *
   */
  constructor(private deps: JarunProcessControllerInnerDeps) {
    this.waiter = new Waiter<States, Events>({
      onError: this.deps.onError,
      startState: "ready",
    });
  }

  /**
   *
   */
  public runTest = (id: string, absTestFile: string) => {
    if (!this.waiter.is("ready")) {
      return prej("Can't run test. (state:" + this.waiter.getState() + ")");
    }

    this.waiter.set("testing");

    this.testProm = getPromise();

    return this.sendRun(id, absTestFile).then(() => def(this.testProm).promise);
  };

  /**
   *
   */
  private sendRun = (id: string, absTestFile: string) => {
    this.curTestId = id;
    this.curTest = absTestFile;
    this.curStdout = "";
    this.curStderr = "";

    return this.deps.prSend({
      type: "run",
      id,
      file: absTestFile,
    });
  };

  /**
   *
   */
  public onRestarted = (): void => {
    this.waiter.event("restarted");

    const state = this.waiter.getState();

    switch (state) {
      case "ready":
        //nothing to do. No test in progress.
        return;

      case "testing":
        this.sendRun(def(this.curTestId), def(this.curTest));
        return;

      case "error":
        this.deps.logProv.log("Impossible: onRestarted, when: " + state + ".");
        return;

      default:
        return assertNever(state);
    }
  };

  public onStdout = (data: Buffer) => {
    if (this.waiter.is("testing")) {
      this.curStdout += data.toString();
    } else {
      this.deps.onRogueTest({ data: { user: { stdout: [data.toString()] } } });
    }
  };

  public onStderr = (data: Buffer) => {
    if (this.waiter.is("testing")) {
      this.curStderr += data.toString();
    } else {
      this.deps.onRogueTest({ data: { user: { stderr: [data.toString()] } } });
    }
  };

  /**
   *
   */
  public onMessage = (msg: RequireSenderMessage | JarunProcessMessage) => {
    switch (msg.type) {
      case "testDone": {
        //not really cloned right. i.e. only shallow. Only a problem for test cases.
        const result: TestResult = {
          ...msg.value,
        };

        //to ensure we don't overwrite something.

        assert(result.cur.user.stdout === undefined);
        assert(result.cur.user.stdout === undefined);

        //add captured io to test result.

        if (this.curStdout) {
          result.cur.user.stdout = [this.curStdout];
        }

        if (this.curStderr) {
          result.cur.user.stderr = [this.curStderr];
        }

        //done

        def(this.testProm).resolve(result);

        this.waiter.set("ready");
        break;
      }

      case "rogue":
        this.deps.onRogueTest(msg.value);
        break;

      // extracting dependencies - Could be given to jates, so ProcessRunner also can have its requiring analyzed.

      case "require":
        this.deps.onRequire(msg);
        break;

      default: {
        // eslint-disable-next-line unused-imports/no-unused-vars-ts
        const nev: never = msg; // we want exhaustive check, but not to throw.

        //send rogue report

        const testId = this.waiter.is("testing")
          ? def(this.curTestId)
          : "unknown";

        this.deps.onRogueTest({
          data: {
            user: {
              onMessage: [
                {
                  ["Recieved while this test executed"]: testId,
                  msg: clone(msg),
                },
              ],
            },
          },
        });

        break;
      }
    }
  };

  /**
   *
   */
  public onUnexpectedExit = () => {
    // output the cache io.

    if (this.curStdout || this.curStderr) {
      console.log({
        panic_stdout: this.curStdout,
        panic_stderr: this.curStderr,
      });
    }

    //

    const state = this.waiter.getState();

    switch (state) {
      case "ready":
        this.deps.logProv.log(
          "Unexpected exit: JarunProcessMain, when: " + state
        );

        this.waiter.set("error");
        return;

      case "testing":
        def(this.testProm).reject(
          new Error("Unexpected exit: JarunProcessMain, when: " + state)
        );

        this.waiter.set("error");
        return;

      case "error":
        this.deps.logProv.log(
          "Impossible: onUnexpectedExit, when: " + state + "."
        );
        return;

      default:
        return assertNever(state);
    }
  };
}
