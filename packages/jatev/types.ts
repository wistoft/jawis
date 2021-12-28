import {
  ZippedTestLog,
  ClientTestReport,
  RogueData,
  TestStatus,
  TestInfo,
} from "^jatec";
import { TestCollection } from "./TestCollection";

export type State = Readonly<{
  isRunning: boolean;
  currentTest?: TestState;
  currentTestFressness?: number;
  tests?: TestCollection; //undefined means nothing received from server.
  executingTest?: { id: string; name: string };

  userMessage: string;
  unknownRogue?: ZippedTestLog[];
}>;

export type StateCallbacks = {
  setIsRunning: (isRunning: boolean) => void;
  setTestSelection: (testCases: TestInfo[][]) => void;
  setExecutingTestCase: (testId?: string) => void;
  setTestReport: (result: ClientTestReport) => void;
  setRogue: (rogue: RogueData) => void;
  showTestCase: (test: string) => void;
  onCloseTestCase: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export type TestState = TestInfo & {
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
