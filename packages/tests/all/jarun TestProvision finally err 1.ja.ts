import { TestProvision } from "^jarun";

import { err } from "^jab";
import { sleeping } from "^yapu";
import { getJarunTestProvision, filterTestLogs } from "../_fixture";

//async exception

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  inner.finally(() =>
    sleeping(0).then(() => {
      err("ups");
    })
  );

  inner.finally(() =>
    sleeping(0).then(() => {
      err("more ups");
    })
  );

  return inner.finallyProv.runFinally().then(() => {
    prov.imp(filterTestLogs(inner.logs));
  });
};
