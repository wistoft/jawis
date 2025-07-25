import { TestProvision } from "^jarun";

import { getJabBeePreloader } from "../_fixture";

// shutdown after shutdown should just be ignored.

export default (prov: TestProvision) => {
  const pp = getJabBeePreloader(prov);

  return pp.shutdown().then(() =>
    pp.shutdown().finally(() => {
      prov.eq("done", pp.waiter.getState());
    })
  );
};
