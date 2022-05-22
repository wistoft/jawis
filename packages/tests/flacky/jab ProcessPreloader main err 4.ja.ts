import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps, getScriptPath } from "../_fixture";
import { err, sleeping } from "^jab";

export default (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov, {
    customBooter: getScriptPath("stderrWithExit0.js"),
  });

  return pp
    .useProcess(deps)
    .then(() => err("unreach"))
    .finally(() => sleeping(100)) //to allow for exit to occur
    .finally(pp.kill);
};
