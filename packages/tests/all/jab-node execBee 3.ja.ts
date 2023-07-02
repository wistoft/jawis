import { execBee } from "^bee-common";
import { TestProvision } from "^jarun";

import { getScriptPath, getLiveMakeJacsWorker } from "../_fixture";

//stdout is also returned, when error is thrown in worker.

export default (prov: TestProvision) =>
  execBee(
    getScriptPath("stdoutAndThrow.js"),
    prov.finally,
    getLiveMakeJacsWorker()
  ).promise;
