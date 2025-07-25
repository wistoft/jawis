import fs from "node:fs";
import path from "node:path";

import {
  JarunTestProvision,
  TestProvision,
  JarunTestRunner,
  JarunTestRunnerDeps,
  BeeRunner,
  TestFileExport,
} from "^jarun";
import { AbsoluteFile, err } from "^jab";
import { TestCurLogs } from "^jatec";

import { MakeBee } from "^bee-common";
import { filterTestResult, filterTestLogs, getLiveMakeJacsWorker } from ".";

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
    finallyFuncTimeout: 20,
    addUhExceptionsToCurrentTest: false,
    onRogueTest: getOnRogueTest(prov, logPrefix),
    ...extraDeps,
  });

/**
 *
 * - makeTest usually don't get any params, like it does here. But testing unhandled errors is easier this way.
 */
export const jtrRunTest = (
  prov: TestProvision,
  makeTest: (jtr: JarunTestRunner) => TestFileExport,
  extraDeps?: Partial<JarunTestRunnerDeps>,
  logPrefix = ""
) => {
  const jtr = getJarunTestRunner(prov, extraDeps, logPrefix);

  return jtr
    .runTest("testId", () => Promise.resolve(makeTest(jtr)))
    .then(filterTestResult);
};

/**
 *
 */
export const getJarunTestProvision = (prov: TestProvision, logPrefix = "") =>
  new JarunTestProvision({
    testId: "myTestId",
    finallyFuncTimeout: 20,
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
      const data = e.getJarunEqAssertationData();

      //stack is ignored
      return {
        exp: data.exp,
        cur: data.cur,
      };
    });

/**
 *
 */
export const getBeeRunner = (prov: TestProvision, makeBee?: MakeBee) =>
  new BeeRunner({
    finally: prov.finally,
    makeBee: makeBee ?? getLiveMakeJacsWorker(),
  });

/**
 *
 */
export const brRunTest = (
  prov: TestProvision,
  absTestFile: AbsoluteFile,
  makeBee?: MakeBee
) => {
  const br = getBeeRunner(prov, makeBee);

  return {
    br,
    promise: br.runTest("testId unused", absTestFile).then((data) => {
      data.execTime = "removed" as any;
      return data;
    }),
  };
};
