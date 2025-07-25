import { TestProvision } from "^jarun";

import { filterTestLogs, getJarunTestProvision } from "../_fixture";

// add new finally when running finally function

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  inner.finally(() => {
    inner.finally(() => {}); //not allowed
  });

  return inner.finallyProv.runFinally().then(() => {
    prov.imp(filterTestLogs(inner.logs));
  });
};
