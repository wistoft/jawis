import { TestProvision } from "^jarun";
import { getPromise } from "^yapu";

import { getJabProcessPreloaderAndDeps, getScriptPath } from "../_fixture";

export default (prov: TestProvision) => {
  const prom = getPromise(); //to avoid registering waiter

  const [pp] = getJabProcessPreloaderAndDeps(prov, {
    customBooter: getScriptPath("stderrWithExit0.js"),
    onExit: prom.resolve,
  });

  return prom.promise.then(pp.kill);
};
