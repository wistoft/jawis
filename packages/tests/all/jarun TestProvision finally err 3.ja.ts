import { TestProvision } from "^jarun";

import { getJarunTestProvision, filterTestLogs } from "../_fixture";

//finally does never resolve

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  inner.finally(() => new Promise(() => {}));

  return inner.finallyProv.runFinally().then(() => {
    prov.imp(filterTestLogs(inner.logs));
  });
};
