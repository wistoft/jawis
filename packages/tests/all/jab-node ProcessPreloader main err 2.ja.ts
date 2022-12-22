import { TestProvision } from "^jarun";

import { err } from "^jab";
import { getJabProcessPreloaderAndDeps, getScriptPath } from "../_fixture";

// exit, while waiting

export default (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov, {
    customBooter: getScriptPath("hello.js"),
  });

  return pp
    .useProcess(deps)
    .then(() => err("unreach"))
    .finally(pp.kill);
};
