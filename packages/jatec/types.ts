import { ClientTestReport, TestCurLogs, TestResult } from ".";

export type OnTestResult = (id: string, result: TestResult) => void;

// rogue

export type RogueData = { id?: string; data: TestCurLogs };

export type OnRogue = (rogue: RogueData) => void;

//
// api - client messasge
//

export type ClientMessage =
  | {
      action: "stopRunning" | "runAllTests" | "runCurrentSelection" | "runDtp";
    }
  | {
      action: "prependTests";
      ids: string[];
    }
  | {
      action: "acceptTestLogs";
      testIds: string[];
    }
  | {
      action: "acceptTestLog";
      testId: string;
      logName: string; //assumes user logs can't have the names in 'reserved' logs.
    }
  | {
      action: "compareTestLog";
      testId: string;
      logName: string;
    }
  | {
      action: "openFile";
      file: string;
      line?: number;
    }
  | {
      action: "openTest";
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
