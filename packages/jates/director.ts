import { LogProv, CompareFiles, HandleOpenFileInEditor } from "^jab";
import { ExternalLogSource } from "^bee-common";
import { WsPoolController, WsPoolProv } from "^jab-express";
import { FinallyFunc } from "^finally-provider";

import {
  ClientMessage,
  getJatesTestReport,
  OnTestResult,
  ServerMessage,
  TestResult,
  MakeTestFrameworks,
  ClientComController,
  Behavior,
  makeOnClientMessage,
  TestExecutionController,
  TestListController,
  TestAnalytics,
  ClientTestInfo,
  ComposedTestFramework,
  combineTestResultWithLogEntries_byref,
} from "./internal";

export type DirectorDeps = Readonly<{
  tecTimeout: number;
  makeTestFrameworks: MakeTestFrameworks;
  handleOpenFileInEditor: HandleOpenFileInEditor;
  compareFiles: CompareFiles;
  externalBeeLogSource: ExternalLogSource;

  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;

  //for testing
  wsPool?: WsPoolProv<ServerMessage, ClientMessage>;
}>;

/**
 * Integrate all the controllers.
 *
 * state
 *   cur test logs are only stored if they are different from expected test logs. Note they aren't removed on accept.
 *
 * Test selection structure
 *  - Defines which tests the client presents to the user.
 *  - Defines a prioritisation of the tests. E.g. sorted by exec time.
 *  - Contains unselected tests as last level.
 *  - It's ok to have the client present tests, that aren't going to execute. The user might be
 *      interested in seeing the unselected tests.
 *
 * Test execution list
 *  - A subset of the selection structure. The tests that will execute.
 *
 */
export const director = (deps: DirectorDeps) => {
  deps.finally(() => behavior.onShutdown()); //trick to register onShutdown, before it has been defined.

  const wsPool = deps.wsPool || new WsPoolController<ServerMessage, ClientMessage>(deps); // prettier-ignore

  const clientCom = new ClientComController({
    wsPool,
  });

  const testAnalytics = new TestAnalytics();

  const testFramework = new ComposedTestFramework({
    onError: deps.onError,
    frameworks: deps.makeTestFrameworks({
      onRogueTest: clientCom.onRogueTest,
      onError: deps.onError,
      logProv: deps.logProv,
      finally: deps.finally,
    }),
  });

  const onTestResult: OnTestResult = (id: string, result: TestResult) => {
    const prom = testFramework.getExpLogs(id).then((exp) => {
      combineTestResultWithLogEntries_byref(
        result.cur,
        deps.externalBeeLogSource.getBufferedLogEntries()
      );

      const report = getJatesTestReport(id, exp, result);

      testAnalytics.setTestExecTime(report.id, report.result.execTime);

      if (report.status !== ".") {
        //why not set always?
        testFramework.setCurLogs(id, result.cur);
      }

      clientCom.onTestReport(report);
    });

    behavior.setWorking(prom);
  };

  const tec = new TestExecutionController({
    ...clientCom,
    timeoutms: deps.tecTimeout,
    testFramework,
    onError: deps.onError,
    onTestResult,
    DateNow: Date.now,
  });

  /**
   * - Sort test cases by execution time.
   * - Send test selection structure to client, and ask TEC to execute the tests.
   */
  const onTestSelectionReady = (ids: ClientTestInfo[]) => {
    const sortedIds = testAnalytics.sortTests(ids);

    clientCom.onTestSelectionReady([sortedIds]);

    tec.setTestList(sortedIds.map((info) => info.id));
  };

  const testListController = new TestListController({
    testFramework,
    onTestSelectionReady,
    onError: deps.onError,
  });

  const behavior = new Behavior({
    ...clientCom,
    onError: deps.onError,
    wsPool,
    testFramework,
  });

  const onClientMessage = makeOnClientMessage({
    ...deps,
    ...clientCom,
    ...tec,
    ...testListController,
    ...behavior,
    testFramework,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(onClientMessage);

  return {
    onWsUpgrade,

    //for testing
    onClientMessage,
    shutdown: () => behavior.onShutdown(),
  };
};
