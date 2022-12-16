import { TestProvision } from "^jarun";

import { getProcessRestarter } from "../_fixture";

// send when initial

export default (prov: TestProvision) => {
  const jpr = getProcessRestarter(prov);

  return jpr.send({}).finally(jpr.kill);
};
