import { execBee, makePlainJabProcess } from "^jab-node";
import { TestProvision } from "^jarun";

import { getScriptPath } from "../_fixture";

//messages are collected.

export default (prov: TestProvision) => {
  const { promise } = execBee(
    getScriptPath("ipcSendOnly.js"),
    prov.finally,
    makePlainJabProcess
  );

  return promise;
};
