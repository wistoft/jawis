import { TestProvision } from "^jarun";

import { getTestExecutionController } from "../_fixture";

//pause while idle.

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  prov.await(tec.pause());

  //not really anything to check
};
