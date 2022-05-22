import {
  assertNever,
  Bee,
  clone,
  ClonedValue,
  FinallyFunc,
  MakeBee,
  unknownToErrorData,
  execBee,
  err,
} from "^jab";
import { JarunTestRunner, TestResult, UserTestLogs } from "^jatec";

export type Deps = Readonly<{
  makeBee: MakeBee;
  filterStdout?: (str: string) => string;
  finally: FinallyFunc;
}>;

/**
 * Run a test completely in its own process/worker.
 *
 */
export class BeeRunner implements JarunTestRunner {
  private curTest?: Bee<any>;

  constructor(private deps: Deps) {}

  /**
   *
   */
  public runTest = (id: string, absTestFile: string) => {
    const startTime = Date.now();

    const { bee, promise } = execBee({
      def: {
        filename: absTestFile,
      },
      finallyFunc: this.deps.finally,
      makeBee: this.deps.makeBee,
    });

    this.curTest = bee;

    return promise.then((data): TestResult => {
      const userLog: UserTestLogs = {};

      if (data.stdout !== "") {
        userLog.stdout = [
          this.deps.filterStdout
            ? this.deps.filterStdout(data.stdout)
            : data.stdout,
        ];
      }

      if (data.stderr !== "") {
        userLog.stderr = [data.stderr];
      }

      if (data.status !== 0) {
        userLog.exitCode = [data.status];
      }

      if (data.messages.length !== 0) {
        userLog.messages = data.messages.map((msg) => clone(msg));
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

      //jago logs

      const addToUserLogHelper = (
        rawLogName: string | undefined,
        values: ClonedValue[]
      ) => {
        const logName = rawLogName || "log";

        const old = logName in userLog ? userLog[logName] : [];
        userLog[logName] = [...old, ...values];
      };

      data.logs.forEach((msg) => {
        switch (msg.type) {
          case "log":
            addToUserLogHelper(msg.logName, msg.data);
            return;

          case "error": {
            const errLog = result.cur.err || (result.cur.err = []);

            errLog.push(msg.data);
            return;
          }

          case "stream":
          case "html":
            throw err("not impl", msg);

          default:
            throw assertNever(msg);
        }
      });
      return result;
    });
  };

  /**
   *
   */
  public kill = () => Promise.resolve().then(() => this.curTest?.kill());
}
