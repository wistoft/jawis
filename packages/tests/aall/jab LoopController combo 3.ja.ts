import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//pause while pausing

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  const p1 = lc.pause();
  const p2 = lc.pause();

  return [p1, p2];
};
