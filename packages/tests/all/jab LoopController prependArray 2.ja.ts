import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//prepend array, when unstarted

export default (prov: TestProvision) => {
  const lc = littleLoop(prov, false);

  lc.prependArray([10]);

  lc.resume();

  return lc.getPromise();
};
