import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//pause while pausing-resuming

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  const p1 = lc.pause();
  lc.resume();

  return [p1, lc.pause()];
};
