import { execBee } from "^bee-common";
import { makePlainJabProcess } from "^jab-node";
import { TestProvision } from "^jarun";

import { getScriptPath } from "../_fixture";

//messages are collected.

export default (prov: TestProvision) =>
  execBee(getScriptPath("ipcSendOnly.js"), prov.finally, makePlainJabProcess)
    .promise;
