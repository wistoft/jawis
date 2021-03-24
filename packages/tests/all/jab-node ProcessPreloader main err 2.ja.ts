import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps, getScriptPath } from "../_fixture";
import { err } from "^jab";

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
