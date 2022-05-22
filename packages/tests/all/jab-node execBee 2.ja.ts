import { execBee } from "^jab";
import { makePlainProcessBee } from "^jab-node";
import { TestProvision } from "^jarun";

import { getScriptPath } from "../_fixture";

//messages are collected.

export default (prov: TestProvision) =>
  execBee({
    def: { filename: getScriptPath("ipcSendOnly.js") },
    finallyFunc: prov.finally,
    makeBee: makePlainProcessBee,
  }).promise;
