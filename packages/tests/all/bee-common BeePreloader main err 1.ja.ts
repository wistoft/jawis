import { TestProvision } from "^jarun";

import { getJabBeePreloaderAndDeps, getScriptPath } from "../_fixture";

//ready signal is never sent.

export default (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov, {
    customBooter: getScriptPath("silent.js"),
  });

  return pp.useBee(deps).then((process) => process.shutdown());
};
