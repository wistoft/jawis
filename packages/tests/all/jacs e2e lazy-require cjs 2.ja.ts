import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { consoleLog, getScriptPath, runJacsBee_test } from "../_fixture";

// Commonjs module exports function

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  const func = require(getScriptPath("exportFunction"));

  consoleLog(func());
};
