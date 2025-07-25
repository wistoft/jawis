import {
  ClientTestInfo,
  ClientTestReport,
  TestCurLogs,
  TestResult,
} from "./internal";

export type OnTestResult = (id: string, result: TestResult) => void;

// rogue

export type RogueData = { id?: string; data: TestCurLogs };

export type OnRogue = (rogue: RogueData) => void;

//
// websocket - client message
//

export type ClientMessage =
  | {
      type:
        | "toggleRunning"
        | "getAllTests"
        | "runAllTests"
        | "runCurrentSelection";
    }
  | {
      type: "prependTests";
      ids: string[];
    }
  | {
      type: "acceptTestLogs";
      testIds: string[];
    }
  | {
      type: "acceptTestLog";
      testId: string;
      logName: string; //assumes user logs can't have the names in 'reserved' logs.
    }
  | {
      type: "compareTestLog";
      testId: string;
      logName: string;
    }
  | {
      type: "openFile";
      file: string;
      line?: number;
    };

//
// websocket - server message
//

export type ServerMessage =
  | {
      type: "IsRunning";
      data: boolean;
    }
  | {
      type: "TestSelection";
      data: ClientTestInfo[][]; //list of levels.
    }
  | {
      type: "TestCaseStarts";
      data: string;
    }
  | {
      type: "TestReport";
      data: ClientTestReport;
    }
  | {
      type: "OnRogue";
      data: RogueData;
    };
