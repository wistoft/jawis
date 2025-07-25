import path from "node:path";

import {
  AbsoluteFile,
  MainFileDeclaration,
  LogEntry,
  unknownToErrorData,
} from "^jab";
import {
  NoopTestLogController,
  TestFrameworkProv,
  TestLogsProv,
  combineTestResultWithLogEntries_byref,
} from "^jates";
import { makePhpProcess } from "^bee-php";
import { execBee } from "^bee-common";
import { assertAbsolute } from "^jab-node";
import { FinallyFunc } from "^finally-provider";

type Deps = {
  absTestFolder: AbsoluteFile;
  onLog: (entry: LogEntry) => void;
  finally: FinallyFunc;
  testLogController?: TestLogsProv;
};

export const PHPUnitAdapterGetTestFilesDeclaration: MainFileDeclaration = {
  type: "plain-file",
  file: "PHPUnitAdapterGetTestFiles.php",
  folder: __dirname,
};

export const PHPUnitAdapterBootstrapDeclaration: MainFileDeclaration = {
  type: "plain-file",
  file: "PHPUnitAdapterBootstrap.php",
  folder: __dirname,
};

/**
 *
 * might need changes for phpunit 10: https://docs.phpunit.de/en/10.3/extending-phpunit.html
 */
export class PHPUnitAdapter implements TestFrameworkProv {
  public testLogController: TestLogsProv;

  constructor(private deps: Deps) {
    this.testLogController = deps.testLogController ?? new NoopTestLogController(); // prettier-ignore
  }

  /**
   *
   */
  public getTestInfo = async () => {
    const booter = assertAbsolute(path.join(__dirname, "PHPUnitAdapterGetTestFiles.php")); // prettier-ignore

    const beeResult = await this.runPhpUnit(booter);

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
   * similarity between BeeRunner, PHPUnitAdapter, BehatAdapter
   */
  public runTest = async (globalId: string, testName: string) => {
    const filename = assertAbsolute(path.join(__dirname, "PHPUnitAdapterBootstrap.php")); // prettier-ignore

    const beeResult = await this.runPhpUnit(filename, [
      "--printer",
      "PHPUnitAdapterTestListener",
      "--filter",
      `/^${testName}$/`,
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
  private runPhpUnit = (booter: AbsoluteFile, args: string[] = []) =>
    execBee<any, never>({
      def: {
        filename: booter,
      },
      finallyFunc: this.deps.finally,
      makeBee: (deps) =>
        makePhpProcess({
          ...deps,
          filename: deps.def.filename,
          cwd: this.deps.absTestFolder,
          args,
        }),
    }).promise;

  /**
   * todo
   */
  public kill = () => Promise.resolve();
}
