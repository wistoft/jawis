import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { consoleLog, runJacsBee_test } from "../_fixture";

import ExportedClass from "../_fixture/projectCommonjs/ExportedClass";

// Use exported default constructor.

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  //nothing loaded
  consoleLog(Object.keys(require.cache).some((elm) => elm.includes("ExportedClass"))); // prettier-ignore

  consoleLog(typeof ExportedClass);
  consoleLog(typeof new ExportedClass());

  //loaded now
  consoleLog(Object.keys(require.cache).some((elm) => elm.includes("ExportedClass"))); // prettier-ignore
};
