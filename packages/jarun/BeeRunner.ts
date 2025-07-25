import { Bee, execBee, MakeBee } from "^bee-common";
import { FinallyFunc } from "^finally-provider";
import { AbsoluteFile, assert, capture } from "^jab";
import {
  combineTestResultWithLogEntries_byref,
  TestResult,
  UserTestLogs,
} from "^jatec";

import { JarunTestRunnerProv } from "./internal";

type Deps = Readonly<{
  makeBee: MakeBee;
  finally: FinallyFunc;
  onExit?: (status?: number | null) => void;
}>;

/**
 * Run a test completely in its own process/worker.
 *
 */
export class BeeRunner implements JarunTestRunnerProv {
  private curTest?: Bee<any>;

  constructor(private deps: Deps) {}

  /**
   * similarity between BeeRunner, PHPUnitAdapter, BehatAdapter
   */
  public runTest = (id: string, absTestFile: AbsoluteFile) => {
    assert(this.curTest === undefined, "Already running");

    const startTime = Date.now();
    let status: number | null | undefined = null;

    const { bee, promise } = execBee({
      def: {
        filename: absTestFile,
      },
      finallyFunc: this.deps.finally,
      makeBee: this.deps.makeBee,

      onExit: (_status) => {
        status = _status;
        this.deps.onExit?.(status);
      },
    });

    this.curTest = bee;

    return promise.then((data): TestResult => {
      const userLog: UserTestLogs = {};

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

      //exit status

      if (status !== null && status !== undefined && status !== 0) {
        result.cur.user["exitcode"] = ["" + status];
      }

      //combine with bee logs

      combineTestResultWithLogEntries_byref(result.cur, data.logs);

      //reset

      this.curTest = undefined;

      //done

      return result;
    });
  };

  /**
   *
   */
  public kill = () =>
    Promise.resolve().then(() => {
      const prom = this.curTest?.kill();

      this.curTest = undefined;

      return prom;
    });
}
