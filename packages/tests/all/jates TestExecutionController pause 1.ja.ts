import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

//pause while running (and pausing)

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  prov.await(tec.pause());
  prov.await(tec.pause());
};
