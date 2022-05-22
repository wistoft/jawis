import { execBee } from "^jab";
import { TestProvision } from "^jarun";

import { getMakeJacsWorker, getScriptPath } from "../_fixture";

//stdout isn't returned, when error is thrown in worker.

//this can't be better without making a custom booter like: `beeConfMain.ts`

export default (prov: TestProvision) =>
  execBee({
    def: { filename: getScriptPath("stdoutAndThrow.js") },
    finallyFunc: prov.finally,
    makeBee: getMakeJacsWorker(),
  }).promise;
