import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

export default (prov: TestProvision) => {
  const lc = littleLoop(prov, false);

  lc.start();

  return lc.getPromise();
};
