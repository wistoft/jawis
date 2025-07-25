import * as ns from "express";
import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { consoleLog, runJacsBee_test } from "../_fixture";

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

// Use ns export (TypeScript adds __importStar)

export const main = () => {
  //no express
  const pre = Object.keys(require.cache).some((elm) => elm.includes("express")); // prettier-ignore

  consoleLog(typeof ns.Router);
  consoleLog(typeof ns.Router());

  //now express is loaded.
  consoleLog(pre);
  consoleLog(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore
};
