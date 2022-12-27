import { execBee } from "^bee-common";
import { TestProvision } from "^jarun";

import { getScriptPath, makeJacsWorker } from "../_fixture";

//stdout is also returned, when error is thrown in worker.

export default (prov: TestProvision) =>
  execBee(getScriptPath("stdoutAndThrow.js"), prov.finally, makeJacsWorker)
    .promise;
