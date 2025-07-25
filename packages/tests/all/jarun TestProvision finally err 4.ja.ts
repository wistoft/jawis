import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

// finally function not allowed after finalize.

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  return inner.finallyProv.runFinally().then(() => {
    inner.finally(() => {}); //not allowed
  });
};
