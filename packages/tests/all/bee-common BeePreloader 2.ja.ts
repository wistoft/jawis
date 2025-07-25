import { TestProvision } from "^jarun";

import { getJabBeePreloaderAndDeps, getScriptPath } from "../_fixture";

//send data to bee

export default (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov, {
    def: { filename: getScriptPath("beePrintData.js"), data: "a message" },
  });

  return pp.useBee(deps).then((process) => process.shutdown());
};
