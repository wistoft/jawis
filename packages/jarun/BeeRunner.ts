import { clone, FinallyFunc } from "^jab";
import { TestRunner } from "^jates";
import { execBee, Bee, MakeBee } from "^jab-node";
import { TestResult, UserTestLogs } from "^jatec";

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

    return promise.then(
      (data): TestResult => {
        const log: UserTestLogs = {};

        if (data.stdout !== "") {
          log.stdout = [data.stdout];
        }

        if (data.stderr !== "") {
          log.stderr = [data.stderr];
        }

        if (data.status !== 0) {
          log.exitCode = [data.status];
        }

        if (data.messages.length !== 0) {
          log.messages = data.messages.map((msg) => clone(msg));
        }

        return {
          cur: {
            user: log,
          },
          execTime: Date.now() - startTime,
        };
      }
    );
  };

  /**
   *
   */
  public kill = () => Promise.resolve().then(() => this.curTest?.kill());
}
