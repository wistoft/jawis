import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test } from "../_fixture";

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: { filename: getScriptPath("hello-jago.php") },
  });
