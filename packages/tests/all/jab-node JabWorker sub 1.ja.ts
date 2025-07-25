import { TestProvision } from "^jarun";
import { getJabWorker_sub_spawn } from "../_fixture";

//spawned process is closed by itself.

export default (prov: TestProvision) => {
  const worker = getJabWorker_sub_spawn(prov, {
    filename: "hello.js",
    collectSubprocesses: true,
  });

  return worker.waiter.await("stopped").then(() => {
    prov.chk(!worker.hasSubprocesses());
  });
};
