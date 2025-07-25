import path from "node:path";

import { assert, unknownToErrorData, LogEntry } from "^jab";
import {
  NoopTestLogController,
  TestFrameworkProv,
  TestLogsProv,
  combineTestResultWithLogEntries_byref,
} from "^jates";
import { makePhpProcess } from "^bee-php";
import { MakeBee, execBee } from "^bee-common";
import { FinallyFunc } from "^finally-provider";
import { assertAbsolute } from "^jab-node";

type Deps = {
  absTestFolder: string;
  onLog: (entry: LogEntry) => void;
  finally: FinallyFunc;
  testLogController?: TestLogsProv;
};

/**
 *
 */
export class BehatAdapter implements TestFrameworkProv {
  public testLogController: TestLogsProv;

  constructor(private deps: Deps) {
    this.testLogController = deps.testLogController ?? new NoopTestLogController(); // prettier-ignore
  }

  /**
   *
   */
  public getTestInfo = async () => {
    const beeResult = await this.runBehat(true);

    //send all info from bee to deps.

    for (const log of beeResult.logs) {
      this.deps.onLog(log);
    }

    //fetch the info

    return beeResult.messages;
  };

  /**
   *
   */
  public getCurrentSelectionTestInfo = async () => [];

  /**
   *
   */
  private splitTestId = (id: string) => {
    const tmp = id.split(":");

    assert(tmp.length >= 2, "Invalid id format.", id);

    const name = tmp.pop() as string;
    const file = tmp.join(":");

    return {
      file,
      name,
    };
  };

  /**
   * similarity between BeeRunner, PHPUnitAdapter, BehatAdapter
   */
  public runTest = async (globalId: string, testId: string) => {
    const info = this.splitTestId(testId);

    const beeResult = await this.runBehat(false, [
      info.file,
      "--name",
      `/^${info.name}$/`,
    ]);

    //validation

    if (beeResult.messages.length !== 1) {
      beeResult.logs.push({
        type: "error",
        data: unknownToErrorData(new Error("Expected one message from test framework"), [beeResult.messages]), // prettier-ignore
      });
    }

    //fall back, if test framework didn't send anything.

    const testResult = beeResult.messages[0] ?? {
      cur: {
        user: {},
      },
    };

    combineTestResultWithLogEntries_byref(testResult.cur, beeResult.logs);

    return testResult;
  };

  /**
   *
   */
  private runBehat = async (dryrun: boolean, extraArgs: string[] = []) =>
    execBee<any, never>({
      def: {
        filename: assertAbsolute(
          path.join(__dirname, "BehatAdapterBootstrap.php")
        ),
      },
      finallyFunc: this.deps.finally,
      makeBee: this.makeMakeBee(dryrun, extraArgs),
    }).promise;

  /**
   *
   */
  private makeMakeBee = (dryrun: boolean, extraArgs: string[]): MakeBee => {
    const args = [
      "--verbose",
      "--format",
      "jate_bahat",
      "--no-colors",
      "--no-interaction",
      "--no-snippets",
      ...extraArgs,
    ];

    if (dryrun) {
      args.push("--dry-run");
    }

    //the makeBee

    return (deps) =>
      makePhpProcess({
        ...deps,
        filename: deps.def.filename,
        cwd: this.deps.absTestFolder,
        args,
        env: {
          DRYRUN: dryrun ? "true" : "false",
          BEHAT_PARAMS: JSON.stringify({
            extensions: {
              "jate_bahat\\MyExtension": {},
            },
          }),
        },
      });
  };

  /**
   * todo
   */
  public kill = () => Promise.resolve();
}
