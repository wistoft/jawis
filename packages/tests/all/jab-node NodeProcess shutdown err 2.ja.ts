import { TestProvision } from "^jarun";

import { getNodeProcess_ready } from "../_fixture";

// double shutdown (in same tick)

export default (prov: TestProvision) =>
  getNodeProcess_ready(prov).then((proc) => {
    const p1 = proc.shutdown();
    const p2 = proc.shutdown().catch(prov.onError);

    return Promise.allSettled([p1, p2]);
  });
