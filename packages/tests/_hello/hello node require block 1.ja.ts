import { TestProvision } from "^jarun";
import { def } from "^jab";

import { getStdinBlockProcess } from "../_fixture";

export default (prov: TestProvision) => {
  const proc = getStdinBlockProcess(prov);

  // free child first
  def(proc.cp.stdin).write("hello");

  return proc.shutdown().then(() => {
    prov.eq("stopped", proc.waiter.getState());
  });
};
