import React from "react";
import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { consoleLog, runJacsBee_test } from "../_fixture";

// Use exported default object. (TypeScript adds __importDefault)

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  //no react
  consoleLog(Object.keys(require.cache).some((elm) => elm.includes("react"))); // prettier-ignore

  //use something in react.
  consoleLog(React.createElement("a", {}));

  //now react is loaded.
  consoleLog(Object.keys(require.cache).some((elm) => elm.includes("react"))); // prettier-ignore
};
