import { execBee } from "^jab";
import { TestProvision } from "^jarun";

import { getMakeJacsWorker, getScriptPath } from "../_fixture";

//stdout is also returned, when error is thrown in worker.

export default (prov: TestProvision) =>
  execBee(getScriptPath("stdoutAndThrow.js"), prov.finally, getMakeJacsWorker())
    .promise;
