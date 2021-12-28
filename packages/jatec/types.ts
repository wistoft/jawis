import { ClientTestReport, TestCurLogs, TestResult } from ".";

export type OnTestResult = (id: string, result: TestResult) => void;

export type TestInfo = {
  id: string;
  name: string;
  file: string; //absolute, it should be.
};

// rogue

export type RogueData = { id?: string; data: TestCurLogs };

export type OnRogue = (rogue: RogueData) => void;

//
// api - client messasge
//

export type ClientMessage =
  | {
      action:
        | "stopRunning"
        | "getAllTests"
        | "runAllTests"
        | "runCurrentSelection"
        | "runDtp";
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
      id: string;
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
      data: TestInfo[][]; //list of levels.
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
