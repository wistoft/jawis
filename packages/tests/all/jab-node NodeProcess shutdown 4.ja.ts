import { TestProvision } from "^jarun";

import { getNodeProcess } from "../_fixture";

// shutdown when process closed

export default (prov: TestProvision) => {
  const proc = getNodeProcess(prov);

  return proc.waiter.await("stopped").then(() => proc.shutdown());
};
