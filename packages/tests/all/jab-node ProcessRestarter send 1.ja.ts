import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { getProcessRestarter, makeInMemoryWppMain } from "../_fixture";

// send when initial cause to process to start

export default (prov: TestProvision) => {
  const jpr = getProcessRestarter(prov, {
    makeBee: makeInMemoryWppMain(prov, true),
  });

  jpr.send({ type: "dummy" });

  return sleeping(10).finally(jpr.kill);
};
