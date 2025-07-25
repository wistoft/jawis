import { TestProvision } from "^jarun";
import { onThrow } from "^long-traces/on-throw";

import { consoleLog, runLiveJacsBee_lazy } from "../_fixture";

// Error trace request in later context. But retains trace from creation context.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  onThrow((error) => {
    consoleLog("onThrow: " + error);
  });

  Promise.resolve()
    .then(() => {
      throw new Error("promise then");
    })
    .catch(() => {
      /* squash */
    });

  new Promise((_, reject) => {
    reject(new Error("promise reject"));
  }).catch(() => {
    /* squash */
  });
};
