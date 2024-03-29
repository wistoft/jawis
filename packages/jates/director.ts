import path from "path";

import { MakeJabProcess } from "^jab-node";
import { LogProv, err, CompareFiles, HandleOpenFileInEditor } from "^jab";
import {
  ClientMessage,
  getJatesTestReport,
  OnTestResult,
  ServerMessage,
  TestResult,
} from "^jatec";
import { WsPoolController } from "^jab-express";

import { FinallyFunc } from "^finally-provider";
import { MakeBee } from "^bee-common";
import {
  ClientComController,
  Behavior,
  makeOnClientMessage,
  TestAnalyticsController,
  TestLogController,
  TestExecutionController,
  TestListController,
  ComposedTestFramework,
  CreateTestRunners,
} from "./internal";

export type DirectorDeps = Readonly<{
  absTestFolder: string;
  absTestLogFolder: string;
  tecTimeout: number;
  handleOpenFileInEditor: HandleOpenFileInEditor;
  compareFiles: CompareFiles;

  createTestRunners: CreateTestRunners;
  makeTsProcess: MakeJabProcess;
  makeTsBee: MakeBee;

  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
}>;

/**
 * Integrate all the controllers.
 *
 * todo: run finally on shutdown.
 *
 * state
 *   cur test logs are only stored if they are different from expected test logs. Note they aren't remove on accept, though.
 */
export const director = (deps: DirectorDeps) => {
  if (!path.isAbsolute(deps.absTestFolder)) {
    err("absTestFolder must be absolute");
  }

  if (!path.isAbsolute(deps.absTestLogFolder)) {
    err("testLogFolder must be absolute");
  }

  deps.finally(() => behavior.onShutdown()); //trick to register onShutdown, before it has been defined.

  const wsPool = new WsPoolController<ServerMessage, ClientMessage>(deps);

  const clientCom = new ClientComController({
    wsPool,
  });

  const testLogController = new TestLogController({
    absTestLogFolder: deps.absTestLogFolder,
    onError: deps.onError,
  });

  const tac = new TestAnalyticsController({
    absTestFolder: deps.absTestFolder,
    onError: deps.onError,
  });

  const runners = deps.createTestRunners({
    onRogueTest: clientCom.onRogueTest,
    makeTsProcess: deps.makeTsProcess,
    makeTsBee: deps.makeTsBee,
    onError: deps.onError,
    logProv: deps.logProv,
    finally: deps.finally,
    onRequire: tac.onRequire,
  });

  const testFramework = new ComposedTestFramework({
    absTestFolder: deps.absTestFolder,
    runners,
    subFolderIgnore: [], //extract to conf
  });

  const onTestResult: OnTestResult = (id: string, result: TestResult) => {
    const prom = testLogController.getExpLogs(id).then((exp) => {
      const report = getJatesTestReport(id, exp, result);

      tac.ta.setTestExecTime(report.id, report.result.execTime);

      if (report.status === ".") {
        tac.ta.setTestValid(report.id);
      } else {
        testLogController.setCurLogs(id, result.cur);
      }

      clientCom.onTestReport(report);
    });

    behavior.setWorking(prom);
  };

  const tec = new TestExecutionController({
    ...clientCom,
    absTestFolder: deps.absTestFolder,
    timeoutms: deps.tecTimeout,
    tr: testFramework,
    onError: deps.onError,
    onTestResult,

    DateNow: Date.now,
  });

  const testListController = new TestListController({
    ...clientCom,
    testFramework,
    ta: tac.ta,
    setTestExecutionList: tec.setTestList,
    onError: deps.onError,
  });

  const behavior = new Behavior({
    onError: deps.onError,
    wsPool,
    testFramework,
  });

  const onClientMessage = makeOnClientMessage({
    ...deps,
    ...clientCom,
    ...testLogController,
    ...tec,
    ...testListController,
    ...behavior,
    absTestFolder: deps.absTestFolder,
    onError: deps.onError,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(onClientMessage);

  return {
    onWsUpgrade,
    onClientMessage,
  };
};
