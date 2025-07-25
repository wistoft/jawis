import { Router } from "express";
import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { consoleLog, runJacsBee_test } from "../_fixture";

// Use only 'member' exports. (TypeScript adds no wrapper function in this case.)

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  //no express
  const pre = Object.keys(require.cache).some((elm) => elm.includes("express")); // prettier-ignore

  consoleLog(typeof Router);
  consoleLog(typeof Router());

  //now express is loaded.
  consoleLog(pre);
  consoleLog(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore
};
