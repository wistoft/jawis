import { TestProvision } from "^jarun";
import { def, sleeping } from "^jab";

import { getStdinBlockProcess } from "../_fixture";

export default (prov: TestProvision) => {
  const proc = getStdinBlockProcess(prov);

  proc.send({ type: "shutdown" });

  return sleeping(100)
    .then(() => {
      // free child after shutdown is sent
      def(proc.cp.stdin).write("hello");

      return proc.waiter.await("stopped");
    })
    .then(() => {
      prov.eq("stopped", proc.waiter.getState());
    });
};
