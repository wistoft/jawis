import os from "os";
import fs from "fs";
import fse from "fs-extra";
import path from "path";

import {
  assert,
  err,
  clonedArrayEntriesTos,
  tryProp,
  ClonedValue,
  clonedTos,
} from "^jab";

import {
  ClientTestReport,
  getClientTestReport,
  TestCurLogs,
  TestExpLogs,
  flatToTestExpLogs_compat,
} from "^jatec";

// prov

export type TestLogsProv = {
  setExpLogs: (testId: string, testLogs: TestExpLogs) => Promise<void>;
  setCurLogs: (testId: string, testLogs: TestCurLogs) => void;
  getExpLogs: (testid: string) => Promise<TestExpLogs>;
  getCurLogs: (testid: string) => TestCurLogs;
  acceptTestLog: (testId: string, logName: string) => Promise<ClientTestReport>;
  acceptTestLogs: (testId: string) => Promise<ClientTestReport>;
  getTempTestLogFiles: (
    testId: string,
    logName: string
  ) => Promise<{ exp: string; cur: string }>;
};

// deps

export type Deps = {
  absTestLogFolder: string;
  onError: (error: unknown) => void;
};

/**
 * Handles store of test logs.
 *
 * - Store current test logs in memory.
 * - Perform compatibility mapping of old test log formats, when reading from disk.
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
   *
   */
  public setExpLogs = (id: string, testLogs: TestExpLogs) => {
    if (!this.ensuredTestDir) {
      fse.ensureDir(this.deps.absTestLogFolder);
      this.ensuredTestDir = true;
    }

    return fs.promises.writeFile(
      this.getExpFilename(id),
      JSON.stringify(testLogs)
    );
  };

  /**
   *
   */
  public setCurLogs = (testId: string, testLogs: TestCurLogs) => {
    this.curTestLogs[testId] = testLogs;
  };

  /**
   *
   */
  public getExpLogs = (id: string) =>
    fs.promises
      .readFile(this.getExpFilename(id))
      .then(
        (data) => JSON.parse(data.toString()),
        (error: unknown) => {
          if (tryProp(error, "code") === "ENOENT") {
            //return an empty test log, when no file.
            return { user: {} };
          }
          throw error;
        }
      )
      .then((logs) => {
        // superficial version test
        if ("user" in logs) {
          return logs as TestExpLogs;
        } else {
          //compat
          return flatToTestExpLogs_compat(logs);
        }
      });

  /**
   *
   */
  public getCurLogs = (testId: string): TestCurLogs => {
    const log = this.curTestLogs[testId];
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

    return getClientTestReport(id, exp, cur);
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

    return getClientTestReport(id, exp, cur);
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
   * - bug: The path of test cases is ignored.
   */
  private getExpFilename = (id: string) =>
    path.join(this.deps.absTestLogFolder, path.basename(id) + ".json");

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
export const optionalOrClonedTos = (value?: ClonedValue) =>
  value === undefined ? "" : clonedTos(value);

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

  return clonedArrayEntriesTos(logs.user[logName]);
};
