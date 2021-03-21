import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//sync pause will allow one iteration.

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  const p1 = lc.pause();
  lc.resume();

  const p2 = lc.pause();

  return [p1, p2];
};
