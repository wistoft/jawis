import { TestProvision } from "^jarun";
import {
  filterStackTraceForLogging_onLog,
  getTsProjectPath,
  runJacsBee_test,
} from "../_fixture";

//source map is in separate file from source code

export default (prov: TestProvision) =>
  runJacsBee_test(prov, {
    def: { filename: getTsProjectPath("transpiled.js") },
    onLog: filterStackTraceForLogging_onLog(prov),
  });
