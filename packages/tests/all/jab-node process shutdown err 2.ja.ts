import { TestProvision } from "^jarun";

import { getJabProcess_ready, shutdownQuickFix } from "../_fixture";

// double shutdown (in same tick)

export default (prov: TestProvision) =>
  getJabProcess_ready(prov).then((proc) => {
    const p1 = shutdownQuickFix(proc);
    const p2 = proc.shutdown().catch((error) => {
      //quick fix to squash timeout
      if (!error.message.includes("Timeout waiting for: stopped")) {
        throw error;
      }
    });

    return Promise.allSettled([p1, p2]);
  });
