import fs from "node:fs";

import { TestProvision } from "^jarun";
import { BeeMain } from "^bee-common";

import { AbsoluteFile } from "^jabc";
import { consoleLog, runJacsBee_test } from "../_fixture";

// Use exported native-default-function.

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main: BeeMain = () => {
  consoleLog(typeof fs);
  consoleLog(fs.existsSync("asdfljk"));
};
