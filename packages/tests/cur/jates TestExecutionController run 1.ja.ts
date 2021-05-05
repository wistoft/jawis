import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

import { getTestExecutionController } from "../_fixture";

//new tests when finished running (idle)

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  tec.setTestList(["more1.test"]);

  return (
    tec.lc.waiter
      .await("done")
      //some other little test case
      .then(() => {
        tec.setTestList([]);

        return tec.lc.waiter.await("done");
      })
  );
};
