import { TestProvision } from "^jarun";

import { getLoopController } from "../_fixture";

export default (prov: TestProvision) =>
  getLoopController(prov, [1], () =>
    Promise.reject(new Error("no no"))
  ).getPromise();
