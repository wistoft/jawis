import path from "path";

import { MakeBee, MakeJabProcess } from "^jab-node";
import { LogProv, err, FinallyFunc } from "^jab";
import {
  ClientMessage,
  getJatesTestReport,
  OnTestResult,
  ServerMessage,
  TestResult,
} from "^jatec";
import { WsPoolController } from "^jab-express";

import { ComposedTestFramework, CreateTestRunners } from ".";
import { ClientComController } from "./ClientComController";
import { Behavior } from "./Behavior";
import { makeOnClientMessage } from "./onClientMessage";
import { TestAnalyticsController } from "./TestAnalyticsController";
import { TestLogController } from "./TestLogController";
import { TestExecutionController } from "./TestExecutionController";
import { TestListController } from "./TestListController";

export type Deps = Readonly<{
  absTestFolder: string;
  absTestLogFolder: string;

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
 */
export const director = (deps: Deps) => {
  if (!path.isAbsolute(deps.absTestFolder)) {
    err("absTestFolder must be absolute");
  }

  if (!path.isAbsolute(deps.absTestLogFolder)) {
    err("testLogFolder must be absolute");
  }

  const wsPool = new WsPoolController<ServerMessage, ClientMessage>({
    ...deps,
    onError: deps.onError,
  });

  const event = new ClientComController({
    wsPool,
  });

  const tlc = new TestLogController({
    absTestLogFolder: deps.absTestLogFolder,
    onError: deps.onError,
  });

  const tac = new TestAnalyticsController({
    absTestFolder: deps.absTestFolder,
    onError: deps.onError,
  });

  const runners = deps.createTestRunners({
    onRogueTest: event.onRogueTest,
    makeTsProcess: deps.makeTsProcess,
    makeTsBee: deps.makeTsBee,
    onError: deps.onError,
    logProv: deps.logProv,
    finally: deps.finally,
    onRequire: tac.onRequire,
  });

  const tf = new ComposedTestFramework({
    absTestFolder: deps.absTestFolder,
    runners,
    subFolderIgnore: [], //extract to conf
  });

  const onTestResult: OnTestResult = (id: string, result: TestResult) => {
    tlc.setCurLogs(id, result.cur);

    return tlc.getExpLogs(id).then((exp) => {
      const report = getJatesTestReport(id, exp, result);

      tac.ta.setTestExecTime(report.id, report.result.execTime);

      if (report.status === ".") {
        tac.ta.setTestValid(report.id);
      }

      event.onTestReport(report);
    });
  };

  const tec = new TestExecutionController({
    ...event,
    absTestFolder: deps.absTestFolder,
    timeoutms: 20000, //extract to conf
    tlc,
    tr: tf,
    onError: deps.onError,
    onTestResult,
  });

  const testListController = new TestListController({
    ...event,
    ta: tac.ta,
    onError: deps.onError,
    tf,
    setTestExecutionList: tec.setTestList,
  });

  const behavior = new Behavior({
    onError: deps.onError,
    wsPool,
    tf,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(
    makeOnClientMessage({
      ...event,
      ...tlc,
      ...tec,
      ...testListController,
      ...behavior,
      absTestFolder: deps.absTestFolder,
      onError: deps.onError,
    })
  );

  return {
    onWsUpgrade,
    onShutdown: behavior.onShutdown,
  };
};
