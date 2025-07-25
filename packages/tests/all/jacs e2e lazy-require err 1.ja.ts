import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { consoleLog, getScriptPath, runJacsBee_test } from "../_fixture";

// Module load throws

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  const mod = require(getScriptPath("throw.js"));
  consoleLog("no problem yet");

  consoleLog(Object.keys(mod));
};
