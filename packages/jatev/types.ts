import { ZippedTestLog, ClientTestReport, RogueData, TestStatus } from "^jatec";
import { TestCollection } from "./TestCollection";

//
// state
//

export type State = Readonly<{
  isRunning: boolean;
  currentTest?: TestState;
  currentTestFressness?: number;
  tests?: TestCollection; //undefined means nothing received from server.
  executingTestId?: string;
  userMessage: string;
  unknownRogue?: ZippedTestLog[];
}>;

//
// callbacks/hooks
//

export type StateCallbacks = {
  setIsRunning: (isRunning: boolean) => void;
  setTestSelection: (testCases: string[][]) => void;
  setExecutingTestCase: (testId?: string) => void;
  setTestReport: (result: ClientTestReport) => void;
  setRogue: (rogue: RogueData) => void;
  showTestCase: (test: string) => void;
  onCloseTestCase: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export type TestState = {
  id: string;
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
