import { TestProvision } from "^jarun";

import { err } from "^jab";
import { sleeping } from "^yapu";
import { getJarunTestProvision, filterTestLogs } from "../_fixture";

//async exception

export default (prov: TestProvision) => {
  const jtp = getJarunTestProvision(prov);

  jtp.finally(() =>
    sleeping(30).then(() => {
      err("ups");
    })
  );
  jtp.finally(() =>
    sleeping(30).then(() => {
      err("more ups");
    })
  );

  return jtp.runFinally().then(() => {
    prov.imp(filterTestLogs(jtp.logs));
  });
};
