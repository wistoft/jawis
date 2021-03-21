import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//sync pause will allow one iteration.

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  return lc.pause();
};
