import { FinallyFunc } from "^jab";
import { TestRunner } from "^jates";
import {
  jsExec,
  makeMakeTsJabProcessConditonally,
  MakeJabProcess,
} from "^jab-node";
import { TestResult, UserTestLogs } from "^jatec";

export type CliCommand = [string, string[]];

export type ProcRunDeps = Readonly<{
  makeTsProcess: MakeJabProcess;
  finally: FinallyFunc;
}>;

/**
 * Run a test completely in its own process.
 *
 */
export class ProcessRunner implements TestRunner {
  private makeTsProcessConditonally: MakeJabProcess;

  constructor(private deps: ProcRunDeps) {
    //doesn't work for dev-main, because it needs to compile its source files.
    this.makeTsProcessConditonally = makeMakeTsJabProcessConditonally(
      deps.makeTsProcess
    );
  }

  /**
   *
   */
  public runTest = (id: string, absTestFile: string) => {
    const startTime = Date.now();

    return jsExec(
      absTestFile,
      undefined,
      this.makeTsProcessConditonally,
      this.deps.finally
    ).then(
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
   * todo: implement.
   */
  public kill = () => Promise.resolve();
}
