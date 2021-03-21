import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//resume after paused

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  return lc.pause().then(() => {
    prov.imp("resuming");
    lc.resume();
    return lc.getPromise();
  });
};
