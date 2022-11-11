import { ErrorData } from "^jab";
import {
  TestProvision,
  JarunProcessController,
  BeeRunner,
  getDefaultRunnersAssignments,
  makeProcessRunner,
} from "^jarun";
import { TestResult, JatesTestReport, TestCurLogs } from "^jatec";
import { makeTsNodeJabProcess } from "^util-javi/node";
import { ComposedTestFramework } from "^jates";
import {
  TestExecutionController,
  TestExecutionControllerDeps,
} from "^jates/TestExecutionController";
import {
  TestListController,
  TestListControllerDeps,
} from "^jates/TestListController";
import { TestLogController } from "^jates/TestLogController";
import { TestAnalytics } from "^jates/TestAnalytics";
import { ClientComController } from "^jates/ClientComController";

import {
  getLogProv,
  WsPoolMock,
  absTestFolder,
  absTestLogFolder,
  TestFrameworkMock,
  makeJacsWorker,
  getScratchPath,
} from ".";

/**
 *
 */
export const filterTestReport = (data: JatesTestReport) => ({
  ...data,
  result: filterTestResult(data.result),
});

/**
 *
 */
export const filterTestResult = (data: Readonly<TestResult>) => {
  const res = {
    ...data,
    cur: filterTestLogs(data.cur),
  };

  delete res["execTime"];
  delete res["requireTime"];

  return res;
};

/**
 *
 */
export const filterTestLogs = (data: Readonly<TestCurLogs>) => {
  const res = {
    ...data,
  };

  if (data.err) {
    res.err = filterErrorLog(data.err);
  }

  if (data.chk) {
    res.chk = {
      ...data.chk,
      stack: "filtered" as any,
    };
  }

  return res;
};

/**
 *
 */
export const filterErrorLog = (testLog: ErrorData[]) =>
  testLog.map((entry) => {
    if (entry.stack) {
      return {
        ...entry,
        stack: "filtered" as any,
      };
    }

    return entry;
  });

/**
 *
 */
export const getTestListController = (
  prov: TestProvision,
  extraDeps?: Partial<TestListControllerDeps>
) => {
  const absTestFolder = "path/to/tests";

  return new TestListController({
    onError: prov.onError,

    testFramework: new TestFrameworkMock(),
    ta: getTestAnalytics(prov, absTestFolder),

    setTestExecutionList: (tests) => {
      prov.log("TestFramework", "setTestExecutionList:");
      prov.log("TestFramework", tests);
    },

    onTestSelectionReady: (tests) => {
      prov.log("TestFramework", "onTestSelectionReady:");
      prov.log("TestFramework", tests);
    },

    ...extraDeps,
  });
};

/**
 *
 */
export const getTestExecutionController = (
  prov: TestProvision,
  logPrefix = ""
) =>
  new TestExecutionController({
    ...getTestExecutionControllerDeps(prov, {}, logPrefix),
    tr: new TestFrameworkMock(),
  });

/**
 *
 */
export const getTestExecutionController_running = (
  prov: TestProvision,
  logPrefix = ""
) => {
  const tec = getTestExecutionController(prov, logPrefix);

  tec.setTestList(["first.test", "second.test"]);

  return tec;
};

/**
 *
 */
export const getTestExecutionControllerDeps = (
  prov: TestProvision,
  extraDeps?: Partial<TestExecutionControllerDeps>,
  logPrefix = ""
): Omit<TestExecutionControllerDeps, "tr"> => ({
  absTestFolder,
  timeoutms: 50,

  onTestStarts: (id) =>
    prov.log(logPrefix + "TestFramework", "onTestStarts: " + id),

  onTestResult: (id, result) => {
    prov.log(logPrefix + "TestFramework", "onTestDone: " + id);
    prov.log(logPrefix + "TestFramework", filterTestResult(result));
  },

  onTestRunnerStarts: () =>
    prov.log(logPrefix + "TestFramework", "onTestRunnerStarts."),

  onTestRunnerStops: () =>
    prov.log(logPrefix + "TestFramework", "onTestRunnerStops."),

  onRogueTest: (data) => {
    prov.log("TestFramework", "onRogueTest: ");
    prov.log("TestFramework", {
      ...data,
      data: filterTestLogs(data.data),
    });
  },

  onError: prov.onError,

  DateNow: () => 1,

  ...extraDeps,
});

/**
 *
 */
export const getComposedTestFramework = (
  prov: TestProvision,
  logPrefix = ""
) => {
  const deps = {
    onError: prov.onError,
    finally: prov.finally,
    logProv: getLogProv(prov, logPrefix),
  };

  const jpc = new JarunProcessController({
    ...deps,
    makeTsBee: makeJacsWorker,
    onRogueTest: (data) => prov.log("Jate", ["onRogueTest: ", data]),
    onRequire: () => {},
  });

  const pr = makeProcessRunner({
    ...deps,
    makeTsProcess: makeTsNodeJabProcess,
  });

  const wo = new BeeRunner({
    ...deps,
    makeBee: makeJacsWorker,
  });

  return new ComposedTestFramework({
    ...deps,
    absTestFolder,
    subFolderIgnore: ["alsoIgnoreThis"],
    runners: getDefaultRunnersAssignments(jpc, pr, wo),
  });
};

/**
 *
 */
export const getTestAnalytics = (prov: TestProvision, absTestFolder = "") =>
  new TestAnalytics({
    absTestFolder,
  });

/**
 *
 */
export const getTestLogController_test_suite = (prov: TestProvision) =>
  new TestLogController({
    absTestLogFolder,
    onError: prov.onError,
  });

/**
 *
 */
export const getTestLogController_scratch = (prov: TestProvision) =>
  new TestLogController({
    absTestLogFolder: getScratchPath(),
    onError: prov.onError,
  });

/**
 *
 */
export const getEventProvider = (prov: TestProvision) =>
  new ClientComController({
    wsPool: new WsPoolMock(prov),
  });
