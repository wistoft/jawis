import { TestProvision } from "^jarun";

import { getProcessRestarter } from "../_fixture";

//kill while starting

export default (prov: TestProvision) => {
  const jpr = getProcessRestarter(prov);

  jpr.firstInitProcess();

  return jpr.kill();
};
