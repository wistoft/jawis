import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

import { emptyLoop, getLoopController, littleLoop } from "../_fixture";

//prepend array, when done

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  return lc.getPromise().then(() => {
    lc.prependArray([10]);
    lc.resume();

    return lc.waiter.await("done");
  });
};
