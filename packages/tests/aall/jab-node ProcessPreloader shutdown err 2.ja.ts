import { TestProvision } from "^jarun";

import { getJabProcessPreloader } from "../_fixture";

// shutdown after shutdown should just be ignored.

export default (prov: TestProvision) => {
  const pp = getJabProcessPreloader(prov);

  return pp.shutdown().then(() =>
    pp.shutdown().finally(() => {
      prov.eq("done", pp.waiter.getState());
    })
  );
};
