import path from "path";

import { LogProv, err, FinallyFunc } from "^jab";
import {
  ClientMessage,
  getJatesTestReport,
  OnTestResult,
  ServerMessage,
  TestResult,
} from "^jatec";
import { WsPoolController } from "^jab-express";

import { MakeTestFramework } from ".";
import { ClientComController } from "./ClientComController";
import { Behavior } from "./Behavior";
import { makeOnClientMessage } from "./onClientMessage";
import { TestAnalyticsController } from "./TestAnalyticsController";
import { TestLogController } from "./TestLogController";
import { TestExecutionController } from "./TestExecutionController";
import { TestListController } from "./TestListController";
import { CompareFiles, HandleOpenFileInEditor } from "^util-javi/node";

export type Deps = Readonly<{
  absTestFolder: string;
  absTestLogFolder: string;
  tecTimeout: number;
  makeTestFramework: MakeTestFramework;
  handleOpenFileInEditor: HandleOpenFileInEditor;
  compareFiles: CompareFiles;

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
export const director = (deps: Deps) => {
  if (!path.isAbsolute(deps.absTestFolder)) {
    err("absTestFolder must be absolute");
  }

  if (!path.isAbsolute(deps.absTestLogFolder)) {
    err("testLogFolder must be absolute");
  }

  deps.finally(() => behavior.onShutdown()); //trick to register onShutdown, before it has been defined.

  const wsPool = new WsPoolController<ServerMessage, ClientMessage>({
    ...deps,
    onError: deps.onError,
  });

  const clientCommunication = new ClientComController({
    wsPool,
  });

  const tac = new TestAnalyticsController({
    absTestFolder: deps.absTestFolder,
    onError: deps.onError,
  });

  const testFramework = deps.makeTestFramework({
    onRogueTest: clientCommunication.onRogueTest,
    onError: deps.onError,
    logProv: deps.logProv,
    finally: deps.finally,
    onRequire: tac.onRequire,
  });

  const testLogController = new TestLogController({
    absTestLogFolder: deps.absTestLogFolder,
    ...testFramework,
    onError: deps.onError,
  });

  const onTestResult: OnTestResult = (id: string, result: TestResult) =>
    testLogController.getExpLogs(id).then((exp) => {
      const report = getJatesTestReport(id, exp, result);

      tac.testAnalytics.setTestExecTime(report.id, report.result.execTime);

      if (report.status === ".") {
        tac.testAnalytics.setTestValid(report.id);
      } else {
        testLogController.setCurLogs(id, result.cur);
      }

      clientCommunication.onTestReport(report);
    });

  const tec = new TestExecutionController({
    ...clientCommunication,
    timeoutms: deps.tecTimeout,
    testFramework,
    onError: deps.onError,
    onTestResult,

    DateNow: Date.now,
  });

  const testListController = new TestListController({
    ...clientCommunication,
    testFramework,
    ta: tac.testAnalytics,
    setTestExecutionList: tec.setTestList,
    onError: deps.onError,
  });

  const behavior = new Behavior({
    onError: deps.onError,
    wsPool,
    testFramework,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(
    makeOnClientMessage({
      ...deps,
      ...clientCommunication,
      ...testLogController,
      ...tec,
      ...testListController,
      ...behavior,
      testFramework,
      onError: deps.onError,
    })
  );

  return {
    onWsUpgrade,
  };
};
