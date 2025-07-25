import { OnError, AbsoluteFile, OnErrorData } from "^jab";
import { RogueData, TestResult } from "^jatec";
import { BeeShutdownMessage } from "^bee-common";
import { FinallyFunc } from "^finally-provider";

export type TestProvision = {
  chk: (val: unknown) => void;
  eq: (exp: unknown, cur: unknown) => void;
  neq: (exp: unknown, cur: unknown) => void;
  imp: (...val: unknown[]) => void;
  div: (...val: unknown[]) => void;
  log: (logName: string, ...value: unknown[]) => void;
  logStream: (logName: string, value: string | Buffer) => void;
  onError: OnError;
  onErrorData: OnErrorData;
  catch: <T>(func: () => T) => T | undefined;
  filter: (logName: string, func: (...val: unknown[]) => unknown[]) => void;
  finally: FinallyFunc;
  await: (prom: Promise<unknown>) => Promise<unknown>;
  res: (exp: unknown, prom: Promise<unknown>) => Promise<void>;
  rej: (exp: unknown, prom: Promise<unknown>) => Promise<void>;
};

export type TestFunction = (prov: TestProvision) => unknown;

export type TestFileExport = TestFunction | { default: TestFunction };

export type JarunTestRunnerProv = {
  runTest: (globalId: string, absTestFile: AbsoluteFile) => Promise<TestResult>;
  kill: () => Promise<void>;
};

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
  | BeeShutdownMessage;
