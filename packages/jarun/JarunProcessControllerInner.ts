import { def, assertNever, prej, LogProv, capture } from "^jab";
import { OnRogue, TestResult } from "^jatec";
import { Waiter } from "^state-waiter";
import { getPromise, PromiseTriple } from "^yapu";

import { JarunProcessControllerMessage, JarunProcessMessage } from "./internal";

export type JarunProcessControllerInnerDeps = {
  onRogueTest: OnRogue;

  //for sending to ProcessRestarter, that is assumed to 'lie' below this.
  prSend: (msg: JarunProcessControllerMessage) => void;
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

    this.sendRun(id, absTestFile);

    this.testProm = getPromise();

    return this.testProm.promise;
  };

  /**
   *
   */
  private sendRun = (id: string, absTestFile: string) => {
    this.curTestId = id;
    this.curTest = absTestFile;
    this.curStdout = "";
    this.curStderr = "";

    this.deps.prSend({
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

  public onStdout = (data: Buffer | string) => {
    if (this.waiter.is("testing")) {
      this.curStdout += data.toString();
    } else {
      this.deps.onRogueTest({ data: { user: { stdout: [data.toString()] } } });
    }
  };

  public onStderr = (data: Buffer | string) => {
    if (this.waiter.is("testing")) {
      this.curStderr += data.toString();
    } else {
      this.deps.onRogueTest({ data: { user: { stderr: [data.toString()] } } });
    }
  };

  /**
   * stdio must be rogue, because we have no way to ensure all io has been received. So it could
   *  go to next test case. It's to much effort to send an end-token on both stdio after test ends, and wait for those here.
   */
  public onMessage = (msg: JarunProcessMessage) => {
    switch (msg.type) {
      case "testDone": {
        //not really cloned right. i.e. only shallow. Only a problem for test cases.
        const result: TestResult = {
          ...msg.value,
        };

        //add captured io to test result.

        if (this.curStdout) {
          result.cur.user["rogue.stdout"] = [this.curStdout + (result.cur.user.stdout ?? "")]; // prettier-ignore
        }

        if (this.curStderr) {
          result.cur.user["rogue.stderr"] = [this.curStderr + (result.cur.user.stderr ?? "")]; // prettier-ignore
        }

        //done

        def(this.testProm).resolve(result);

        this.waiter.set("ready");
        break;
      }

      case "rogue":
        this.deps.onRogueTest(msg.value);
        break;

      default: {
        // eslint-disable-next-line unused-imports/no-unused-vars
        const _: never = msg; // we want exhaustive check, but not to throw.

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
                  msg: capture(msg),
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
    // emit cached io.

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
