import { prej } from "^jab";
import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

//res assertation where promise throws.

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  return inner.res("hej", prej("ups"));
};
