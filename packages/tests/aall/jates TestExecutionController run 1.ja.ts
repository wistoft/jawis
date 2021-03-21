import { TestProvision } from "^jarun";

import { getTestExecutionController } from "../_fixture";

//new tests when finished running (idle)

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  prov.eq(false, tec.isRunning());

  tec.setTestList(["more1.test"]);

  prov.eq(true, tec.isRunning());

  return (
    tec.waiter
      .await("idle")
      //some other little test case
      .then(() => {
        tec.setTestList([]);
        return tec.waiter.await("idle");
      })
  );
};
