import { TestProvision } from "^jarun";
import {
  filterStackTraceForLogging_onLog,
  getTsProjectPath,
  runJacsBee_test,
} from "../_fixture";

//source map inline in source code

export default (prov: TestProvision) =>
  runJacsBee_test(prov, {
    def: { filename: getTsProjectPath("transpiled2.js") },
    onLog: filterStackTraceForLogging_onLog(prov),
  });
