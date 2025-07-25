import { TestProvision } from "^jarun";
import { runJacsBee_test } from "^tests/_fixture";
import { getCommonJsProjectPath } from "../_fixture";

//import js-file in commonjs repo

export default (prov: TestProvision) =>
  runJacsBee_test(prov, {
    def: { filename: getCommonJsProjectPath("importJsFile.js") },
  });
