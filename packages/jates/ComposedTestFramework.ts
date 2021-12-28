import path from "path";

import { looping, toInt } from "^jab";
import { TestFrameworkProv, MinimalTestId, TestInfo, TestResult } from "^jatec";
import { JarunTestFramework } from "^jates";

export type ComposedTestFrameworkDeps = {
  absTestLogFolder: string;
  onError: (error: unknown) => void;
  frameworks: TestFrameworkProv<MinimalTestId>[];

  //quick fix
  jarun: JarunTestFramework;
};

export type ComposedTestFrameworkProv = {
  getTestIds: () => Promise<TestInfo[]>;
  getCurrentSelectionTestIds: () => Promise<TestInfo[]>;
  runTest: (id: string) => Promise<TestResult>;
  kill: () => Promise<void>;
};

type TestLocation = {
  file: string;
  line?: number;
};

/**
 * Composes all the frameworks that are given, and makes a facade to abstactly interact with them all.
 *
 */
export class ComposedTestFramework implements ComposedTestFrameworkProv {
  constructor(private deps: ComposedTestFrameworkDeps) {}

  /**
   *
   * - If a test framework rejects, the error is just reported.
   *    Tests from other frameworks are still returned.
   *
   * todo: wouldn't it be better to report errors early?
   */
  public getTestIds = async () => {
    const proms = this.deps.frameworks.map((framework, frameworkId) =>
      framework
        .getTestIds()
        .then((ids) => this.mapTestIdsToInfo(frameworkId, ids))
    );

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
   * quick fix
   */
  public getCurrentSelectionTestIds = () =>
    this.deps.jarun
      .getCurrentSelectionTestIds()
      .then((ids) => this.mapTestIdsToInfo(0, ids));

  /**
   *
   */
  public getTestLocation = (id: string): TestLocation => {
    const testDef = this.decodeId(id);
    return {
      file: testDef.file,
      line: testDef.line,
    };
  };

  /**
   * - bug: The path of test cases is ignored.
   */
  public getExpFilename = (id: string) =>
    path.join(
      this.deps.absTestLogFolder,
      path.basename(this.decodeId(id).file) + ".json"
    );

  /**
   *
   */
  private mapTestIdsToInfo = (frameworkId: number, ids: MinimalTestId[]) =>
    ids.map((id) => ({
      id: this.encodeId(frameworkId, id),
      name: id.name,
      file: id.file,
    }));

  /**
   * Make an id, that can be used globally in jate.
   *
   * - We need this, because an id must be a comparable by value. It's inconvenient to do deepEqual everywhere.
   *    Not to speak of the problem of using object-ids as keys in a Map.
   */
  private encodeId = (frameworkId: number, id: MinimalTestId) =>
    `${frameworkId}\x00${id.name}\x00${id.file}\x00${id.line ? id.line : ""}`;

  /**
   *
   */
  private decodeId = (encodedId: string): MinimalTestId => {
    const elms = encodedId.split("\x00");

    const res: MinimalTestId = {
      name: elms[1],
      file: elms[2],
    };

    if (elms[3]) {
      res.line = toInt(elms[3]);
    }

    return res;
  };

  /**
   * Return the framework, that a test case belongs to.
   */
  private getFramework = (id: string) => {
    const fid = toInt(id.slice(0, id.indexOf("\x00")));

    return this.deps.frameworks[fid];
  };

  /**
   *
   */
  public runTest = (id: string) =>
    this.getFramework(id).runTest(id, this.decodeId(id));

  /**
   *
   */
  public kill = () =>
    looping(this.deps.frameworks, (framework) => framework.kill());
}
