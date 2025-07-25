import path from "node:path";
import readdirRecursive from "fs-readdir-recursive";

import { AbsoluteFile, err } from "^jab";
import {
  TestInfo,
  TestFrameworkProv,
  TestLogsProv,
  TestLogController,
} from "^jates";
import { looping } from "^yapu";

import { JarunTestRunnerProv } from "./internal";

type Deps = {
  absTestFolders: string[];
  absTestLogFolder: string;
  subFolderIgnore: string[];
  runners: { [suffix: string]: JarunTestRunnerProv };
  onError: (error: unknown) => void;
};

/**
 * Composes all the runners that are supported.
 *
 * - Locates test files.
 * - Assigns the right runner to a test file.
 */
export class JarunTestFramework implements TestFrameworkProv {
  public testLogController: TestLogsProv;

  private suffixes: string[];

  constructor(private deps: Deps) {
    this.suffixes = Object.keys(this.deps.runners);

    this.testLogController = new TestLogController(deps);
  }

  /**
   *
   */
  public getTestInfo = () => this.getTestsInFolders(this.deps.absTestFolders);

  /**
   *
   */
  public getCurrentSelectionTestInfo = () =>
    this.getTestsInFolders(
      this.deps.absTestFolders.map((folder) => path.join(folder, "cur"))
    );

  /**
   *
   *  - If rejection, the error is just reported. The other tests are still returned.
   *
   * note
   *    - pretty much the same as ComposedTestFramework.getTestIds
   *    - wouldn't it be better to report errors early?
   */
  private getTestsInFolders = async (absFolders: string[]) => {
    const proms = absFolders.map((folder) => this.getTestsInFolder(folder));

    const data = await Promise.allSettled(proms);

    return data.reduce<TestInfo[]>((acc, cur) => {
      if (cur.status === "fulfilled") {
        return acc.concat(cur.value);
      } else {
        this.deps.onError(cur.reason);
        return acc;
      }
    }, []);
  };

  /**
   * Retrieves all tests.
   *
   * - Test file suffixes are defined in configuration.
   * - Test name is the relative filename.
   */
  private getTestsInFolder = (absFolder: string) =>
    Promise.resolve().then(() =>
      readdirRecursive(
        absFolder,
        (name: string) =>
          !name.startsWith("_") && !this.deps.subFolderIgnore.includes(name)
      )
        .filter(this.registeredTest)
        .map(
          (relFile: string): TestInfo => ({
            id: path.join(absFolder, relFile) as AbsoluteFile,
            name: relFile,
            file: path.join(absFolder, relFile) as AbsoluteFile,
          })
        )
    );

  /**
   * Returns true if a filename is a test case.
   */
  private registeredTest = (testFile: string) => {
    for (const suffix of this.suffixes) {
      if (testFile.endsWith(suffix)) {
        return true;
      }
    }
    return false;
  };

  /**
   * Select the appropriate runner for a given test case.
   */
  private getRunner = (testFile: AbsoluteFile) => {
    for (const suffix of this.suffixes) {
      if (testFile.endsWith(suffix)) {
        return this.deps.runners[suffix];
      }
    }

    throw err("No runner owns this test.", testFile);
  };

  /**
   * Run a single test case and return the test logs.
   */
  public runTest = (globalId: string, testFile: string) =>
    this.getRunner(testFile as AbsoluteFile).runTest(
      globalId,
      testFile as AbsoluteFile
    );

  /**
   *
   */
  public kill = () =>
    looping(Object.values(this.deps.runners), (runner) => runner.kill());
}
