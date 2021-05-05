import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//set new array, while first iteration is running

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  lc.setArray([10]);

  return lc.getPromise();
};
