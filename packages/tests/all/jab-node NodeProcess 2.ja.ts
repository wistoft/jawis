import { TestProvision } from "^jarun";

import { getNodeProcess } from "../_fixture";

// child closes itself.

export default (prov: TestProvision) => {
  const proc = getNodeProcess(prov);
  prov.eq("running", proc.waiter.getState());

  return proc.waiter.await("stopped").then(() => {
    prov.eq("stopped", proc.waiter.getState());
  });
};
