import { RogueData, TestResult } from "^jatec";

import { TestProvision } from "./JarunTestProvision";

export type TestFunction = (prov: TestProvision) => unknown;

export type TestFileExport = TestFunction | { default: TestFunction };

/**
 *
 */
export type JarunProcessMessage =
  | {
      type: "testDone";
      value: TestResult;
    }
  | {
      type: "rogue";
      value: RogueData;
    };

/**
 *
 */
export type JarunProcessControllerMessage =
  | {
      type: "run";
      id: string;
      file: string;
    }
  | {
      type: "shutdown";
    };
