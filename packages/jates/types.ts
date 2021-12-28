import { FinallyFunc, LogProv } from "^jab";
import { OnRequire } from "^jabc";
import { OnRogue } from "^jatec";
import { ComposedTestFramework } from "^jates";

//
// test framework
//

export type MakeTestFramework = (deps: {
  onRogueTest: OnRogue;
  onRequire: OnRequire;

  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
}) => ComposedTestFramework;
