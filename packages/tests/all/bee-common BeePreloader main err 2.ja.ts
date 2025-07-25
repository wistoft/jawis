import { TestProvision } from "^jarun";

import { err } from "^jab";
import { getJabBeePreloaderAndDeps, getScriptPath } from "../_fixture";

// exit, while waiting

export default (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov, {
    customBooter: getScriptPath("hello.js"),
  });

  return pp
    .useBee(deps)
    .then(() => err("unreach"))
    .finally(pp.kill);
};
