import { TestProvision } from "^jarun";
import { makeMakeJacsWorkerBee } from "^jacs/make";
import { TS_TIMEOUT } from "^jab-node";
import { getBeeDeps, getScriptPath } from "../_fixture";

// dummy booter

export default (prov: TestProvision) => {
  const makeJacsBee = makeMakeJacsWorkerBee({
    customBooter: getScriptPath("hello.js"),
    onError: prov.onError,
    finally: prov.finally,
  });

  const bee = makeJacsBee(getBeeDeps(prov));

  return bee.waiter.await("stopped", TS_TIMEOUT);
};
