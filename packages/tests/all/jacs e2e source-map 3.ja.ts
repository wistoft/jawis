import { TestProvision } from "^jarun";
import {
  filterStackTraceForLogging_onLog,
  getScriptPath,
  runJacsBee_test,
} from "../_fixture";

//source map inline in source code from jacs

export default (prov: TestProvision) =>
  runJacsBee_test(prov, {
    def: { filename: getScriptPath("throwTs.ts") },
    onLog: filterStackTraceForLogging_onLog(prov),
  });
