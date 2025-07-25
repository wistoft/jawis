import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

//rej assertation with unknown error object.

export default (prov: TestProvision) => {
  prov.filter("console.log", (...val: unknown[]) => {
    if (val[0] === "JarunPromise: Could not wrap non object.") {
      return [];
    } else {
      return val;
    }
  });

  const inner = getJarunTestProvision(prov);

  return inner.rej("ups", Promise.reject("ups"));
};
