import { TestProvision } from "^jarun";

import { getWaiter_non_stopping } from "../_fixture";

// no stopping-state and async kill is not allowed.

export default (prov: TestProvision) =>
  getWaiter_non_stopping(prov)
    .killReal({ kill: () => Promise.resolve(), autoEnd: true })
    .then(() => {
      prov.imp("unreach");
    });
