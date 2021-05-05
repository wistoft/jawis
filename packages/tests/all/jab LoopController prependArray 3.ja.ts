import { TestProvision } from "^jarun";

import { getLoopController } from "../_fixture";

//prepend array, when unstarted (empty array)

export default (prov: TestProvision) => {
  const lc = getLoopController(
    prov,
    [],
    (n) => {
      prov.imp(n);
      return Promise.resolve();
    },
    false
  );

  lc.prependArray([10]);

  lc.resume();

  return lc.getPromise();
};
