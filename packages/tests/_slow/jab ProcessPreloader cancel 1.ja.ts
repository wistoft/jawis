import { TS_TIMEOUT } from "^jab-node";
import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps } from "../_fixture";

// no problem to cancel, when starting.

export default (prov: TestProvision) => {
  const [pp] = getJabProcessPreloaderAndDeps(prov);

  pp.cancel();

  return pp.waiter.await("ready", TS_TIMEOUT).then(() => pp.kill());
};
