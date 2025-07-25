import { TestProvision } from "^jarun";

import { getLiveMakeJacsWorker, getScriptPath, testExecBee } from "../_fixture";

//stdout is returned, when error is thrown in worker.

export default (prov: TestProvision) =>
  testExecBee(prov, {
    def: { filename: getScriptPath("stdoutAndThrow.js") },
    finallyFunc: prov.finally,
    makeBee: getLiveMakeJacsWorker(),
  });
