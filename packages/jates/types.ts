import { MakeBee } from "^bee-common";
import { FinallyFunc } from "^finally-provider";
import { LogProv } from "^jab";
import { MakeJabProcess, OnRequire } from "^jab-node";
import { OnRogue, TestRunner } from "^jatec";

//
// test framework
//

export type CreateTestRunners = (deps: {
  onRogueTest: OnRogue;
  onRequire: OnRequire;

  makeTsProcess: MakeJabProcess;
  makeTsBee: MakeBee;

  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
}) => { [suffix: string]: TestRunner };
