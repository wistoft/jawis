import { TestProvision } from "^jarun";

import { getJabProcess } from "../_fixture";

// shutdown on closed process is okay.

export default (prov: TestProvision) => {
  const proc = getJabProcess(prov);

  return proc.waiter.await("stopped").then(() => proc.shutdown());
};
