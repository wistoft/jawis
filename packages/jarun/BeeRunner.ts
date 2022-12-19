import { capture, unknownToErrorData } from "^jab";
import { TestRunner } from "^jates";
import { execBee, Bee, MakeBee } from "^jab-node";
import { TestResult, UserTestLogs } from "^jatec";
import { FinallyFunc } from "^finally-provider";

export type Deps = Readonly<{
  makeBee: MakeBee;
  finally: FinallyFunc;
}>;

/**
 * Run a test completely in its own process/worker.
 *
 */
export class BeeRunner implements TestRunner {
  private curTest?: Bee<any>;

  constructor(private deps: Deps) {}

  /**
   *
   */
  public runTest = (id: string, absTestFile: string) => {
    const startTime = Date.now();

    const { bee, promise } = execBee(
      absTestFile,
      this.deps.finally,
      this.deps.makeBee
    );

    this.curTest = bee;

    return promise.then((data): TestResult => {
      const userLog: UserTestLogs = {};

      if (data.stdout !== "") {
        userLog.stdout = [data.stdout];
      }

      if (data.stderr !== "") {
        userLog.stderr = [data.stderr];
      }

      if (data.status !== 0) {
        userLog.exitCode = [data.status];
      }

      if (data.messages.length !== 0) {
        userLog.messages = data.messages.map((msg) => capture(msg));
      }

      //the rest

      const result: TestResult = {
        cur: {
          user: userLog,
        },
        execTime: Date.now() - startTime,
      };

      //errors

      if (data.errors.length !== 0) {
        result.cur.err = data.errors.map((error) => unknownToErrorData(error));
      }

      return result;
    });
  };

  /**
   *
   */
  public kill = () => Promise.resolve().then(() => this.curTest?.kill());
}
