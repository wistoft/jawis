import { prej } from "^jab";
import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

//rej assertation as expected

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  return inner.rej("ups", prej("ups"));
};
