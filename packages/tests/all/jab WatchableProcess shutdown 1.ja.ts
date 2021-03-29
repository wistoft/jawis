import { TestProvision } from "^jarun";

import { getJabWatchableProcess } from "../_fixture";

export default (prov: TestProvision) => {
  const { imp } = prov;

  return getJabWatchableProcess(prov).then((wp) => {
    imp("process state: " + wp.waiter.getState());

    return wp.shutdown().then(() => {
      imp("process state: " + wp.waiter.getState());
    });
  });
};
