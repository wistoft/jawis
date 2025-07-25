import { OnError, toInt } from "^jab";
import { looping } from "^yapu";

import {
  TestFrameworkProv,
  TestInfo,
  ClientTestInfo,
  TestResult,
  TestCurLogs,
} from "./internal";

export type ComposedTestFrameworkDeps = {
  onError: OnError;
  frameworks: TestFrameworkProv[];
};

export type ComposedTestFrameworkProv = {
  getTestInfo: () => Promise<ClientTestInfo[]>;
  getCurrentSelectionTestInfo: () => Promise<ClientTestInfo[]>;
  runTest: (id: string) => Promise<TestResult>;
  kill: () => Promise<void>;
};

/**
 * Composes all the frameworks that are given, and makes a facade to abstractly interact with them all.
 *
 */
export class ComposedTestFramework implements ComposedTestFrameworkProv {
  constructor(private deps: ComposedTestFrameworkDeps) {}

  /**
   *
   * - If a test framework rejects, the error is just reported.
   *    Tests from other frameworks are still returned.
   *
   * todo
   *  - wouldn't it be better to report errors early?
   *  - and what about timeout. Adaptors aren't that reliable.
   */
  public getTestInfo = () =>
    this.mapFrameworksToInfo((framework) => framework.getTestInfo());

  /**
   *
   */
  public getCurrentSelectionTestInfo = () =>
    this.mapFrameworksToInfo((framework) =>
      framework.getCurrentSelectionTestInfo()
    );

  /**
   *
   */
  private mapFrameworksToInfo = async (
    map: (framework: TestFrameworkProv) => Promise<TestInfo[]>
  ) => {
    const proms = this.deps.frameworks.map((framework, frameworkId) =>
      map(framework).then((ids) => this.mapTestsToInfo(frameworkId, ids))
    );

    const data = await Promise.allSettled(proms);

    return data.reduce<ClientTestInfo[]>((acc, cur) => {
      if (cur.status === "fulfilled") {
        return acc.concat(cur.value);
      } else {
        //report error, but don't fail, just because one test framework failed.
        this.deps.onError(cur.reason, ["Test framework threw."]);
        return acc;
      }
    }, []);
  };

  /**
   *
   */
  private mapTestsToInfo = (frameworkId: number, tests: TestInfo[]) =>
    tests.map(
      (test): ClientTestInfo => ({
        id: this.encodeId(frameworkId, test),
        name: test.name,
        file: test.file,
        line: test.line,
      })
    );

  /**
   * Make an id, that can be used globally in jate.
   *
   * - We need this, because jatev has no knownledge of the different frameworks a test case can come from.
   */
  private encodeId = (frameworkId: number, info: TestInfo) =>
    `${frameworkId}\x00${info.id}`;

  /**
   *
   */
  private getLocalTestId = (globalId: string): string =>
    globalId.slice(globalId.indexOf("\x00") + 1);

  /**
   * Return the framework, that a test case belongs to.
   */
  private getFramework = (globalId: string) => {
    const fid = toInt(globalId.slice(0, globalId.indexOf("\x00")));

    return this.deps.frameworks[fid];
  };

  /**
   *
   */
  public runTest = (id: string) =>
    this.getFramework(id).runTest(id, this.getLocalTestId(id));

  /**
   *
   */
  public setCurLogs = (id: string, testLogs: TestCurLogs) =>
    this.getFramework(id).testLogController.setCurLogs(
      this.getLocalTestId(id),
      testLogs
    );

  /**
   *
   */
  public getExpLogs = (id: string) =>
    this.getFramework(id).testLogController.getExpLogs(this.getLocalTestId(id));

  /**
   *
   */
  public acceptTestLogs = async (id: string) =>
    this.getFramework(id).testLogController.acceptTestLogs(
      this.getLocalTestId(id)
    );

  /**
   *
   */
  public acceptTestLog = async (id: string, logName: string) =>
    this.getFramework(id).testLogController.acceptTestLog(
      this.getLocalTestId(id),
      logName
    );

  /**
   *
   */
  public getTempTestLogFiles = (id: string, logName: string) =>
    this.getFramework(id).testLogController.getTempTestLogFiles(
      this.getLocalTestId(id),
      logName
    );

  /**
   *
   */
  public kill = () =>
    looping(this.deps.frameworks, (framework) => framework.kill());
}
