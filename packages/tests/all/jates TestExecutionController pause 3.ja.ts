import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  prov.await(tec.pause());

  tec.resume();

  prov.await(tec.pause());
};
