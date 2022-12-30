import fs from "fs";
import path from "path";
import readdirRecursive from "fs-readdir-recursive";

import { err } from "^jab";

import { looping } from "^yapu";
import { TestRunner } from "./internal";

export type TestFrameworkProv = TestRunner & {
  getTestIds: () => Promise<string[]>; //Relative to absTestFolder.
  getCurrentSelectionTestIds: () => Promise<string[]>;
};

export type TestFrameworkDeps = {
  absTestFolder: string;
  subFolderIgnore: string[];
  runners: { [suffix: string]: TestRunner };
};

/**
 * Composes all the frameworks that are supported.
 *
 */
export class ComposedTestFramework implements TestFrameworkProv {
  private suffixes: string[];

  constructor(private deps: TestFrameworkDeps) {
    this.suffixes = Object.keys(this.deps.runners);
  }

  /**
   * Retrieves all tests. Test file suffixes are defined in configuration.
   *
   * - Test id is the relative filename.
   */
  public getTestIds = () =>
    Promise.resolve().then(() =>
      readdirRecursive(this.deps.absTestFolder, (name: string) => {
        return (
          !name.startsWith("_") && !this.deps.subFolderIgnore.includes(name)
        );
      }).filter(this.registeredTest)
    );

  /**
   *
   */
  public getCurrentSelectionTestIds = () => {
    const folder = path.join(this.deps.absTestFolder, "cur");

    if (!fs.existsSync(folder)) {
      return Promise.resolve([]);
    }

    return fs.promises
      .readdir(folder)
      .then((list) => list.map((file) => path.join("cur", file)))
      .then((list) => list.filter(this.registeredTest));
  };

  /**
   * Returns true if a filename is a test case.
   */
  private registeredTest = (id: string) => {
    for (const suffix of this.suffixes) {
      if (id.endsWith(suffix)) {
        return true;
      }
    }
    return false;
  };

  /**
   * Select the appropriate runner for a given test case.
   */
  private getRunner = (id: string) => {
    for (const suffix of this.suffixes) {
      if (id.endsWith(suffix)) {
        return this.deps.runners[suffix];
      }
    }

    throw err("No runner owns this test.", id);
  };

  /**
   * Run a single test case and return the test logs.
   */
  public runTest = (id: string, absTestFile: string) =>
    this.getRunner(id).runTest(id, absTestFile);

  /**
   *
   */
  public kill = () =>
    looping(Object.values(this.deps.runners), (runner) => runner.kill());
}
