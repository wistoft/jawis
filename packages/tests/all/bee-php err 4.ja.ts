import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: { filename: makeTempFile(`<?php \${"var"}["prop"];`) },
  });
