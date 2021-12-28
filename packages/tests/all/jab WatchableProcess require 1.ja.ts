import { getPromise } from "^jab";
import { TestProvision } from "^jarun";

import {
  getJabWatchableProcess,
  getScriptPath,
  logRequireMessage,
} from "../_fixture";

export default (prov: TestProvision) => {
  const prom = getPromise();

  getJabWatchableProcess(prov, {
    onMessage: (m: any) => {
      logRequireMessage(m);
    },
    onExit: prom.resolve,
    filename: getScriptPath("WPP_require.js"),
    filterRequireMessages: false,
  });

  return prom.promise;
};
