import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

import { getWaiter_stuck_in_stopping_state } from "../_fixture";

// kill while stopping: cancels await-shutdown, and makes the kill normally.

export default (prov: TestProvision) => {
  const [waiter, shutdownProm] = getWaiter_stuck_in_stopping_state(prov);

  //We sleep to ensure shutdown has entered into waiting state. (has registered await end-state)
  return sleeping(10).then(() => {
    const p2 = waiter.killReal({
      kill: () => {
        prov.imp("killing");

        prov.eq("stopping", waiter.getState());
        waiter.set("done");
      },
      noisyName: "",
    });

    return Promise.all([shutdownProm.catch(prov.onError), p2]);
  });
};
