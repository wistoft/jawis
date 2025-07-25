import express from "express";
import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { consoleLog, runJacsBee_test } from "../_fixture";

// Use exported default function (TypeScript adds __importDefault)

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  //no express
  const pre = Object.keys(require.cache).some((elm) => elm.includes("express")); // prettier-ignore

  consoleLog(typeof express);
  consoleLog(typeof express());

  //now express is loaded.
  consoleLog(pre);
  consoleLog(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore
};
