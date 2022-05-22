import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

//rej assertation with unknown error object.

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  //quick fix for bug in "1.0.2-dev.1". It had JarunPromise
  prov.filter("console.log", (...val: unknown[]) => {
    if (
      val.length > 0 &&
      val[0] === "JarunPromise: Could not wrap non object."
    ) {
      return [];
    } else {
      return val;
    }
  });

  return inner.rej("ups", Promise.reject("ups"));
};
