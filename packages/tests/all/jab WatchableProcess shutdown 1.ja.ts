import { TestProvision } from "^jarun";
import { Waiter } from "^state-waiter";

import { getJabWatchableProcess, shutdownQuickFix } from "../_fixture";

export default (prov: TestProvision) => {
  const { imp } = prov;

  return getJabWatchableProcess(prov).then((wp) => {
    const waiter = (wp as any).waiter as Waiter<never, never>;

    imp("process state: " + waiter.getState());

    return shutdownQuickFix(wp).then(() => {
      imp("process state: " + waiter.getState());
    });
  });
};
