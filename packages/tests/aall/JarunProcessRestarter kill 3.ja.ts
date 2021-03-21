import { TestProvision } from "^jarun";

import { getProcessRestarter } from "../_fixture";

//double kill (sync)

export default (prov: TestProvision) => {
  const jpr = getProcessRestarter(prov);

  prov.await(jpr.kill());
  prov.await(jpr.kill());
};
