import { TestProvision } from "^jarun";

import { err } from "^jab";
import { getJarunTestProvision, filterTestLogs } from "../_fixture";

//sync exception

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  inner.finally(() => {
    err("ups");
  });

  return inner.finallyProv.runFinally().then(() => {
    prov.imp(filterTestLogs(inner.logs));
  });
};
