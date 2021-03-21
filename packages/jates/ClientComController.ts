import { WsPoolProv } from "^jab-express";

import {
  ServerMessage,
  OnRogue,
  RogueData,
  ClientMessage,
  JatesTestReport,
  ClientTestReport,
} from "^jatec";

export type ClientComProv = {
  onTestStarts: (testId: string) => void;
  onTestReport: (data: JatesTestReport) => void;
  onTestRunnerStarts: () => void;
  onTestRunnerStops: () => void;
  onTestSelectionReady: (tests: string[][]) => void;
  notifyIsRunning: (running: boolean) => void;
  sendTestReport: (data: ClientTestReport) => void;
  onRogueTest: OnRogue;
};

// deps

export type Deps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
};

/**
 *
 */
export class ClientComController implements ClientComProv {
  constructor(private deps: Deps) {}

  public onTestRunnerStarts = () => {
    this.notifyIsRunning(true);
  };

  public onTestRunnerStops = () => {
    this.notifyIsRunning(false);
  };

  public notifyIsRunning = (running: boolean) => {
    this.deps.wsPool.send({
      type: "IsRunning",
      data: running,
    });
  };

  public onTestStarts = (testId: string) => {
    this.deps.wsPool.send({
      type: "TestCaseStarts",
      data: testId,
    });
  };

  /**
   *
   */
  public onTestReport = (report: JatesTestReport) => {
    this.sendTestReport({
      id: report.id,
      status: report.status,
      testLogs: report.zippedTestLogs,
    });
  };

  /**
   * sends TestReport to client. It's only a subset of the information.
   */
  public sendTestReport = (report: ClientTestReport) => {
    this.deps.wsPool.send({
      type: "TestReport",
      data: report,
    });
  };

  /**
   *
   */
  public onTestSelectionReady = (tests: string[][]) => {
    this.deps.wsPool.send({
      type: "TestSelection",
      data: tests,
    });
  };

  /**
   *
   */
  public onRogueTest = (data: RogueData) => {
    this.deps.wsPool.send({
      type: "OnRogue",
      data,
    });
  };
}
