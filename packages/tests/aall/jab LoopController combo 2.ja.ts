import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//resume while pausing

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  const prom = lc.pause();
  lc.resume();
  lc.resume();

  return lc.waiter
    .await("resume")
    .then(() => lc.getPromise())
    .then(() => prom);
};
