import { prej } from "^jab";
import { TestProvision } from "^jarun";

import { catchChkLog, getJarunTestProvision } from "../_fixture";

//rej assertation that fails

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  return catchChkLog(() => inner.rej("hej", prej("wrong")));
};
