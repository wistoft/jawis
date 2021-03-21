import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

//rej assertation, that resolves

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  return inner.rej("ups", Promise.resolve("What went right?"));
};
