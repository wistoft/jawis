import { TestProvision } from "^jarun";

import { getLiveMakeJacsWorker, getScriptPath, testExecBee } from "../_fixture";

export default (prov: TestProvision) =>
  testExecBee(prov, {
    def: { filename: getScriptPath("hello.js") },
    finallyFunc: prov.finally,
    makeBee: getLiveMakeJacsWorker(),
  });
