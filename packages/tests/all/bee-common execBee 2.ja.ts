import { TestProvision } from "^jarun";

import { getLiveMakeJacsWorker, getScriptPath, testExecBee } from "../_fixture";

//messages are collected.

export default (prov: TestProvision) =>
  testExecBee(prov, {
    def: { filename: getScriptPath("beeSend.js") },
    finallyFunc: prov.finally,
    makeBee: getLiveMakeJacsWorker(),
  });
