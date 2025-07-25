import { TestProvision } from "^jarun";
import { getScriptPath, runJacsBee_test } from "../_fixture";

//exported main function gets worker data.

export default (prov: TestProvision) =>
  runJacsBee_test(prov, {
    def: { filename: getScriptPath("hello.js") },
  });
