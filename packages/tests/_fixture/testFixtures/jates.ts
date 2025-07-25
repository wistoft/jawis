import path from "node:path";

import { ErrorData, FileService, LogEntry } from "^jab";
import { NodeWS } from "^jab-express";
import { ProcessRestarter } from "^process-util";
import { getAbsoluteSourceFile_dev as getAbsoluteSourceFile } from "^dev/util";
import { makeProcessRunner, makeTsNodeJabProcess } from "^javi/internal";
import {
  TestProvision,
  JarunProcessController,
  BeeRunner,
  JarunTestFramework,
} from "^jarun/internal";

import {
  TestResult,
  JatesTestReport,
  TestCurLogs,
  ClientTestInfo,
  TestInfo,
  TestExecutionController,
  TestExecutionControllerDeps,
  TestListController,
  TestListControllerDeps,
  TestAnalytics,
  ClientComController,
  DirectorDeps,
  director,
  ServerMessage,
  ClientMessage,
  TestLogController,
} from "^jates/internal";

import {
  getLogProv,
  WsPoolMock,
  absTestFolder,
  absTestLogFolder,
  TestFrameworkMock,
  getLiveMakeJacsWorker,
  getScratchPath,
  makeOnLog,
  filterAbsoluteFilepath,
} from ".";

export const makeTestInfo = (str: string): ClientTestInfo => ({
  id: str,
  name: str,
  file: str,
});

/**
 *
 */
export const filterTestInfo = <T extends TestInfo>(data: T[]) =>
  data.map((info) => ({
    ...info,
    //this id format is specific to jarun.
    id: filterAbsoluteFilepath(info.id),
    name: info.name.replace(/\\/g, "/"),
    file: filterAbsoluteFilepath(info.file),
  }));

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
export const getJatesDirector = (
  prov: TestProvision,
  extraDeps?: Partial<DirectorDeps>,
  externalLogEntries: LogEntry[] = []
) => {
  const fileService: FileService = {
    handleOpenFileInEditor: () => {},
    handleOpenRelativeFileInEditor: () => {},
    compareFiles: () => {},
  };

  const d = director({
    tecTimeout: 100,
    makeTestFrameworks: () => [new TestFrameworkMock()],
    externalBeeLogSource: {
      getBufferedLogEntries: () => externalLogEntries,
    },
    onError: prov.onError,
    finally: prov.finally,
    logProv: getLogProv(prov),
    wsPool: new WsPoolMock<ServerMessage, ClientMessage>({
      log: prov.log,
    }),
    ...fileService,
    ...extraDeps,
  });

  //to avoid specifying NodeWs each time.

  const onClientMessage = (
    msg: ClientMessage,
    nws?: NodeWS<ServerMessage, ClientMessage>
  ) => d.onClientMessage(msg, nws || ({ ws: "dummy" } as any));

  return {
    ...d,
    onClientMessage,
  };
};

/**
 *
 */
export const getTestListController = (
  prov: TestProvision,
  extraDeps?: Partial<TestListControllerDeps>
) =>
  new TestListController({
    onError: prov.onError,

    testFramework: new TestFrameworkMock(),

    onTestSelectionReady: (tests) => {
      prov.log("TestFramework", "onTestSelectionReady:");
      prov.log("TestFramework", tests);
    },

    ...extraDeps,
  });

/**
 *
 */
export const getTestExecutionController = (
  prov: TestProvision,
  logPrefix = ""
) =>
  new TestExecutionController({
    ...getTestExecutionControllerDeps(prov, {}, logPrefix),
    testFramework: new TestFrameworkMock(),
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
): Omit<TestExecutionControllerDeps, "testFramework"> => ({
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
    onLog: makeOnLog(prov),

    makeProcessRestarter: (deps) =>
      new ProcessRestarter({ ...deps, makeBee: getLiveMakeJacsWorker() }),

    onRogueTest: (data) => prov.log("Jate", ["onRogueTest: ", data]),
    getAbsoluteSourceFile,
  });

  const pr = makeProcessRunner({
    ...deps,
    makeTsProcess: makeTsNodeJabProcess,
  });

  const wo = new BeeRunner({
    ...deps,
    makeBee: getLiveMakeJacsWorker(),
  });

  return new JarunTestFramework({
    ...deps,
    absTestFolders: [absTestFolder],
    absTestLogFolder: absTestLogFolder,
    subFolderIgnore: ["alsoIgnoreThis"],
    runners: {
      ".ja.js": jpc,
      ".ja.ts": jpc,
      ".ja.jsx": jpc,
      ".ja.tsx": jpc,
      ".pr.js": pr,
      ".pr.ts": pr,
      ".wo.js": wo,
      ".wo.ts": wo,
    },
  });
};

/**
 *
 */
export const getTestAnalytics = () => new TestAnalytics();

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
