import { ClientTestReport, TestCurLogs, TestResult } from "./internal";

export type OnTestResult = (id: string, result: TestResult) => void;

// rogue

export type RogueData = { id?: string; data: TestCurLogs };

export type OnRogue = (rogue: RogueData) => void;

//
// api - client messasge
//

export type ClientMessage =
  | {
      type: "stopRunning" | "runAllTests" | "runCurrentSelection";
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
    }
  | {
      type: "openTest";
      file: string;
    };

//
// api - server message
//

export type ServerMessage =
  | {
      type: "IsRunning";
      data: boolean;
    }
  | {
      type: "TestSelection";
      data: string[][]; //list of levels.
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
