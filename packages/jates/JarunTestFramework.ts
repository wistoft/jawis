import path from "path";
import readdirRecursive from "fs-readdir-recursive";

import { err, looping } from "^jab";
import { MinimalTestId, TestFrameworkProv, JarunTestRunner } from "^jatec";

type Deps = {
  absTestFolders: string[];
  subFolderIgnore: string[];
  runners: { [suffix: string]: JarunTestRunner };
  onError: (error: unknown) => void;
};

/**
 * Composes all the runners that are supported.
 *
 * - Locates test files.
 * - Assigns the right runner to a test file.
 */
export class JarunTestFramework implements TestFrameworkProv<MinimalTestId> {
  private suffixes: string[];

  constructor(private deps: Deps) {
    this.suffixes = Object.keys(this.deps.runners);
  }

  /**
   *
   */
  public getTestIds = () => this.getTestsInFolders(this.deps.absTestFolders);

  /**
   *
   */
  public getCurrentSelectionTestIds = () =>
    this.getTestsInFolders(
      this.deps.absTestFolders.map((folder) => path.join(folder, "cur"))
    );

  /**
   *
   *  - If rejection, the error is just reported. The other tests are still returned.
   *
   * note
   *    - pretty much the same as ComposedTestFramework.getTestIds
   *
   * todo: wouldn't it be better to report errors early?
   */
  private getTestsInFolders = async (absFolders: string[]) => {
    const proms = absFolders.map((folder) => this.getTestsInFolder(folder));

    const data = await Promise.allSettled(proms);

    return data.reduce<MinimalTestId[]>((acc, cur) => {
      if (cur.status === "fulfilled") {
        return acc.concat(cur.value);
      } else {
        this.deps.onError(cur.reason);
        return acc;
      }
    }, []);
  };

  /**
   * Retrieves all tests. Test file suffixes are defined in configuration.
   *
   * - Test name is the relative filename.
   */
  private getTestsInFolder = (absFolder: string) =>
    Promise.resolve().then(() =>
      readdirRecursive(absFolder, (name: string) => {
        return (
          !name.startsWith("_") && !this.deps.subFolderIgnore.includes(name)
        );
      })
        .filter(this.registeredTest)
        .map(
          (relFile: string): MinimalTestId => ({
            name: relFile,
            file: path.join(absFolder, relFile),
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
  private getRunner = (testFile: string) => {
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
  public runTest = (globalId: string, testInfo: MinimalTestId) =>
    this.getRunner(testInfo.file).runTest(globalId, testInfo.file);

  /**
   *
   */
  public kill = () =>
    looping(Object.values(this.deps.runners), (runner) => runner.kill());
}
