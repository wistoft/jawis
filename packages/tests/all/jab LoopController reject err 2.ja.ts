import { TestProvision } from "^jarun";

import { getLoopController } from "../_fixture";

//rejection while pausing.

export default (prov: TestProvision) => {
  const lc = getLoopController(prov, [1], () =>
    Promise.reject(new Error("no no"))
  );

  const pausing = lc.pause();
  lc.resume();

  return [pausing, lc.getPromise()];
};
