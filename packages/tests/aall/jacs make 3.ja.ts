import { TestProvision } from "^jarun";
import { TS_TIMEOUT } from "^jab-node";
import {
  getBeeDeps,
  getTsProjectPath,
  makeMakeJacsBee_test,
} from "../_fixture";

//ts paths are correctly handled

export default (prov: TestProvision) => {
  const bee = makeMakeJacsBee_test(prov)(
    getBeeDeps(prov, { filename: getTsProjectPath("hello2.ts") })
  );

  return bee.waiter.await("stopped", 2 * TS_TIMEOUT);
};
//
