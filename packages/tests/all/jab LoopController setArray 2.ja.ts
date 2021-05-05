import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//set new array, when done

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  return lc.getPromise().then(() => {
    lc.setArray([10]);
    lc.resume();

    return lc.waiter.await("done");
  });
};
