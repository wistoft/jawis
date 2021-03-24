import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

//res assertation that succeeds

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  return inner.res("hej", Promise.resolve("hej"));
};
