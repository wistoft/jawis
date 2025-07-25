import { WsStates } from "^react-use-ws";

import {
  TestCollection,
  ZippedTestLog,
  ClientTestReport,
  RogueData,
  TestStatus,
  ClientTestInfo,
  ClientMessage,
} from "./internal";

export type ApiProv = {
  apiSend: (data: ClientMessage) => void;
  wsState: WsStates;
};

//
// state
//

export type State = Readonly<{
  isRunning: boolean;
  currentTest?: TestState;
  currentTestFressness?: number;
  tests?: TestCollection; //undefined means nothing received from server.
  executingTest?: { id: string; name: string };

  userMessage: string;
  unknownRogue?: ZippedTestLog[];
}>;

//
// callbacks/hooks
//

export type StateCallbacks = {
  setIsRunning: (isRunning: boolean) => void;
  setTestSelection: (testCases: ClientTestInfo[][]) => void;
  setExecutingTestCase: (testId?: string) => void;
  setTestReport: (result: ClientTestReport) => void;
  setRogue: (rogue: RogueData) => void;
  clearAllRogueData: () => void;
  showTestCase: (test: string) => void;
  onCloseTestCase: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export type TestState = ClientTestInfo & {
  status?: TestStatus;
  testLogs?: ZippedTestLog[];
  rogue?: boolean;
};

export type TestStateUpdate = {
  id: string;
  status: TestStatus;
  testLogs: ZippedTestLog[];
  rogue?: boolean;
};
