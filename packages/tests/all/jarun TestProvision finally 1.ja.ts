import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { getJarunTestProvision } from "../_fixture";

//ordinary use

export default (prov: TestProvision) => {
  const jtp = getJarunTestProvision(prov);

  jtp.finally(() =>
    sleeping(0).then(() => {
      jtp.imp("in final");
      console.log("out in final");
    })
  );

  return jtp.finallyProv.runFinally().then(() => {
    prov.imp(jtp.logs);
  });
};
