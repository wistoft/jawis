import { TestProvision } from "^jarun";

import { infiniteLoop } from "../_fixture";

//pause after paused

export default (prov: TestProvision) => {
  const lc = infiniteLoop(prov);

  return lc.pause().then(() => lc.pause());
};
