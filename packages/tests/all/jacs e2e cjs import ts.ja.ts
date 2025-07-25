import { TestProvision } from "^jarun";
import { getCommonJsProjectPath, runJacsBee_test } from "../_fixture";

//import ts-file in commonjs repo

export default (prov: TestProvision) =>
  runJacsBee_test(prov, {
    def: { filename: getCommonJsProjectPath("importTsFile.js") },
  });
