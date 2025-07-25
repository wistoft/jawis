import { TestProvision } from "^jarun";

import { getStdProcess } from "../_fixture";

// child closes itself.

export default (prov: TestProvision) => {
  const proc = getStdProcess(prov, {
    filename: "node",
    args: ["-e", "console.log('from script');"],
  });

  return proc.waiter.await("stopped");
};
