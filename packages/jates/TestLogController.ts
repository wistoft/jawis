import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import fse from "fs-extra";

import {
  assert,
  err,
  capturedArrayEntriesTos,
  tryProp,
  CapturedValue,
  capturedTos,
} from "^jab";
import { TestCurLogs, TestExpLogs, TestLogsProv } from "^jatec";

type Deps = {
  absTestLogFolder: string;
  onError: (error: unknown) => void;
};

/**
 * Handles store of test logs.
 *
 * - Store current test logs in memory.
 *
 * note
 *  - Assumes test logs are cloned for JSON 'safety' by the test framework.
 */
export class TestLogController implements TestLogsProv {
  private curTestLogs: { [_: string]: TestCurLogs | undefined };

  //to avoid doing the IO all the time.
  private ensuredTestDir = false;

  constructor(private deps: Deps) {
    this.curTestLogs = {};
  }

  /**
   * - bug: The path of test cases is ignored.
   */
  public getExpFilename = (id: string) => {
    //quick fix for windows, because of 'alternate data streams'
    const file = id.replace(/:/g, "-");

    return path.join(this.deps.absTestLogFolder, path.basename(file) + ".json");
  };

  /**
   * public for tests
   */
  public setExpLogs = async (file: string, testLogs: TestExpLogs) => {
    if (!this.ensuredTestDir) {
      await fse.ensureDir(this.deps.absTestLogFolder);
      this.ensuredTestDir = true;
    }

    return fs.promises.writeFile(
      this.getExpFilename(file),
      JSON.stringify(testLogs)
    );
  };

  /**
   *
   */
  public setCurLogs = (id: string, testLogs: TestCurLogs) => {
    this.curTestLogs[id] = testLogs;
  };

  /**
   *
   */
  public getExpLogs = (id: string): Promise<TestExpLogs> =>
    fs.promises.readFile(this.getExpFilename(id)).then(
      (data) => JSON.parse(data.toString()),
      (error: unknown) => {
        if (tryProp(error, "code") === "ENOENT") {
          //return an empty test log, when no file.
          return { user: {} };
        }
        throw error;
      }
    );

  /**
   *
   */
  public getCurLogs = (id: string): TestCurLogs => {
    const log = this.curTestLogs[id];
    if (log) {
      return log;
    } else {
      throw new Error("No cur test logs.");
    }
  };

  /**
   * Accept all logs for a single test case.
   */
  public acceptTestLogs = async (id: string) => {
    const cur = this.getCurLogs(id);
    const exp = { ...cur, err: cur["err"]?.map((err) => err.msg) };

    await this.setExpLogs(id, exp);

    return { exp, cur };
  };

  /**
   * Load an store the logs, and return report for client.
   *
   * - return new test report for client view.
   */
  private acceptTestLogHelper = async (
    id: string,
    cb: (old: TestExpLogs, cur: TestCurLogs) => TestExpLogs
  ) => {
    const oldExp = await this.getExpLogs(id);

    const cur = this.getCurLogs(id);
    const exp = cb(oldExp, cur);

    await this.setExpLogs(id, exp);

    return { exp, cur };
  };

  /**
   * Accept a single log for a single test case.
   */
  public acceptTestLog = (id: string, logName: string) =>
    this.acceptTestLogHelper(id, (old, cur) => {
      if (logName === "err") {
        return {
          ...old,
          [logName]: cur[logName]?.map((err) => err.msg),
        };
      }

      if (logName === "return") {
        return {
          ...old,
          [logName]: cur[logName],
        };
      }

      if (logName === "chk") {
        throw new Error("can't accept chk log");
      }

      // it must be a user log

      if (!(logName in cur.user || logName in old.user)) {
        err("expected an user log: ", logName, cur);
      }

      return {
        ...old,
        user: { ...old.user, [logName]: cur.user[logName] },
      };
    });

  /**
   *
   */
  public getTempTestLogFiles = (id: string, logName: string) =>
    this.getExpLogs(id).then((expLogs) => {
      const curLogs = this.getCurLogs(id);

      const expStr = expLogTos(expLogs, curLogs, logName);
      const curStr = curLogTos(curLogs, logName);

      const exp = path.join(os.tmpdir(), "expLog");
      const cur = path.join(os.tmpdir(), "curLog");

      return fs.promises
        .writeFile(exp, expStr)
        .then(() =>
          fs.promises.writeFile(cur, curStr).then(() => ({ exp, cur }))
        );
    });
}

//
// util
//

/**
 *
 */
export const optionalOrClonedTos = (value?: CapturedValue) =>
  value === undefined ? "" : capturedTos(value);

/**
 *
 */
const expLogTos = (exp: TestExpLogs, cur: TestCurLogs, logName: string) => {
  if (logName === "chk") {
    return optionalOrClonedTos(cur.chk?.exp);
  }

  return logTosHelper(exp, logName);
};

/**
 *
 */
const curLogTos = (cur: TestCurLogs, logName: string) => {
  if (logName === "chk") {
    return optionalOrClonedTos(cur.chk?.cur);
  }

  return logTosHelper(cur, logName);
};

/**
 *
 */
const logTosHelper = (logs: TestCurLogs | TestExpLogs, logName: string) => {
  assert(logName !== "err"); //the view doesn't need this.
  assert(logName !== "chk"); //handled another way.

  //system logs

  if (logName === "return") {
    return optionalOrClonedTos(logs[logName]);
  }

  //it must be a user log.

  return capturedArrayEntriesTos(logs.user[logName]);
};
