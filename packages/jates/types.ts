import { FinallyFunc } from "^finally-provider";
import { LogProv } from "^jab";
import { MakeBee, MakeJabProcess, OnRequire } from "^jab-node";
import { OnRogue, TestResult } from "^jatec";

//
// test framework
//

export type TestRunner = {
  runTest: (id: string, absTestFile: string) => Promise<TestResult>;
  kill: () => Promise<void>;
};

export type CreateTestRunners = (deps: {
  onRogueTest: OnRogue;
  onRequire: OnRequire;

  makeTsProcess: MakeJabProcess;
  makeTsBee: MakeBee;

  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
}) => { [suffix: string]: TestRunner };
