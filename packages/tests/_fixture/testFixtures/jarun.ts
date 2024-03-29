import fs from "fs";
import path from "path";

import {
  JarunTestProvision,
  TestProvision,
  JarunTestRunner,
  createJarunPromise,
  JarunTestRunnerDeps,
  JarunEqAssertation,
  BeeRunner,
  TestFileExport,
} from "^jarun";
import { assert, err } from "^jab";
import { TestCurLogs } from "^jatec";

import { filterTestResult, filterTestLogs } from "./jates";
import { getLiveMakeJacsWorker } from ".";

/**
 *
 */
export const absTestFolder = fs.realpathSync(
  path.join(__dirname, "../testsuite")
);

export const absTestLogFolder = fs.realpathSync(
  path.join(__dirname, "../testsuite/_testLogs")
);

export const getRunTestArgs = (testId: string): [string, string] => [
  testId,
  path.join(absTestFolder, testId),
];

/**
 *
 */
export const getJarunTestRunner = (
  prov: TestProvision,
  extraDeps?: Partial<JarunTestRunnerDeps>,
  logPrefix = ""
) =>
  new JarunTestRunner({
    timeoutms: 50,
    onRogueTest: getOnRogueTest(prov, logPrefix),
    ...extraDeps,
  });

/**
 *
 */
export const jtrRunTest = (
  prov: TestProvision,
  makeTest: () => TestFileExport,
  extraDeps?: Partial<JarunTestRunnerDeps>,
  logPrefix = ""
) => {
  const jtr = getJarunTestRunner(prov, extraDeps, logPrefix);

  return jtr.runTest("testId", makeTest).then(filterTestResult);
};

/**
 *
 */
export const getJarunTestProvision = (prov: TestProvision, logPrefix = "") =>
  new JarunTestProvision({
    testId: "myTestId",
    onRogueTest: getOnRogueTest(prov, logPrefix),
  });

/**
 *
 */
export const getJarunTestProvision_inactive = (
  prov: TestProvision,
  logPrefix = ""
) => {
  const jtp = getJarunTestProvision(prov, logPrefix);

  jtp.active = false;

  return Promise.resolve(jtp);
};

/**
 *
 */
export const getOnRogueTest =
  (prov: TestProvision, logPrefix = "") =>
  (rogue: { id?: string; data: TestCurLogs }) => {
    prov.log(logPrefix + "onRogueTest", {
      ...rogue,
      data: filterTestLogs(rogue.data),
    });
  };

/**
 *
 */
export const catchChkLog = (func: () => void) =>
  Promise.resolve(func())
    .then(() => {
      err("exception expected");
    })
    .catch((e) => {
      assert(e.name === "JarunEqAssertation");

      const data = (e as JarunEqAssertation).getSomething();

      //stack is ignored
      return {
        exp: data.exp,
        cur: data.cur,
      };
    });

/**
 *
 */
export const getJarunPromiseClass = (prov: TestProvision) =>
  createJarunPromise(getJarunTestProvision(prov));

/**
 *
 */
export const newJarunPromise = <T>(
  prov: TestProvision,
  executor: (
    resolve: (value?: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) => void
) => {
  const JarunPromise = getJarunPromiseClass(prov);

  return new JarunPromise(executor);
};

/**
 *
 */
export const getBeeRunner = (prov: TestProvision) =>
  new BeeRunner({
    finally: prov.finally,
    makeBee: getLiveMakeJacsWorker(),
  });

/**
 *
 */
export const brRunTest = (prov: TestProvision, absTestFile: string) => {
  const br = getBeeRunner(prov);

  return {
    br,
    promise: br.runTest("testId unused", absTestFile).then((data) => {
      data.execTime = "removed" as any;
      return data;
    }),
  };
};
