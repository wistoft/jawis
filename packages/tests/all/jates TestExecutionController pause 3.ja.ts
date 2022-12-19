import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();
  tec.resume();
  tec.pause();

  return sleeping(100);
};
