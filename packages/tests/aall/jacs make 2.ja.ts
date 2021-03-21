import { TestProvision } from "^jarun";
import { TS_TIMEOUT } from "^jab-node";
import { getBeeDeps, getScriptPath, makeMakeJacsBee_test } from "../_fixture";

//hello

export default (prov: TestProvision) => {
  const bee = makeMakeJacsBee_test(prov)(
    getBeeDeps(prov, { filename: getScriptPath("helloJab.ts") })
  );

  return bee.waiter.await("stopped", 2 * TS_TIMEOUT);
};
