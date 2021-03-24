import { TestProvision } from "^jarun";

import { catchChkLog, getJarunTestProvision } from "../_fixture";

//res assertation that fails

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  return catchChkLog(() => inner.res("hej", Promise.resolve("wrong")));
};
