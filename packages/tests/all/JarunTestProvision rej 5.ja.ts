import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

//rej assertation with unknown error object.

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  return inner.rej("ups", Promise.reject("major ups"));
};
