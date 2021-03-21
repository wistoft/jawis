import { TestProvision } from "^jarun";

import { newJarunPromise } from "../_fixture";

export default (prov: TestProvision) =>
  newJarunPromise(prov, (resolve) => {
    resolve("no problem");
  }).finally(() => {
    throw new Error("Problem in finally");
  });
