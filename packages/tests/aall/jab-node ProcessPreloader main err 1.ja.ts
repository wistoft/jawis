import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps, getScriptPath } from "../_fixture";

//ready signal is never sent.

export default (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov, {
    customBooter: getScriptPath("silent.js"),
  });

  return pp.useProcess(deps).then((process) => process.shutdown());
};
