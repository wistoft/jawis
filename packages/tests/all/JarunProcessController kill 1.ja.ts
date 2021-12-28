import { TestProvision } from "^jarun";

import { getJarunProcessController } from "../_fixture";

//kill while starting

export default (prov: TestProvision) =>
  getJarunProcessController(prov).noisyKill();
