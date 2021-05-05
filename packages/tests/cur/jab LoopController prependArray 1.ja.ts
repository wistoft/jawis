import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//prepend array, while first iteration is running

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  lc.prependArray([10]);

  return lc.getPromise();
};
