import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//sync resume

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  lc.resume();

  return lc.getPromise();
};
