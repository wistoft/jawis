import { err } from "^jab";
import { TestProvision } from "^jarun";
import { getPromise } from "^yapu";

import { getJabBeePreloaderAndDeps, getScriptPath } from "../_fixture";

export default (prov: TestProvision) => {
  const done = getPromise<void>();

  const [pp, deps] = getJabBeePreloaderAndDeps(prov, {
    customBooter: getScriptPath("stderrWithExit0.js"),
    onExit: done.resolve,
  });

  return pp
    .useBee(deps)
    .then(() => err("unreach"))
    .finally(() => done.promise) //to allow for exit to occur
    .finally(pp.kill);
};
