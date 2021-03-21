import { TestProvision } from "^jarun";

import { getProcessRestarter_running } from "../_fixture";

export default (prov: TestProvision) =>
  getProcessRestarter_running(prov).then((jpr) => jpr.noisyKill());
