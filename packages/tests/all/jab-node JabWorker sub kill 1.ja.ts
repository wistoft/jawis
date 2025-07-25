import { TestProvision } from "^jarun";
import { getJabWorker_sub_spawn } from "../_fixture";

//kill spawned process that closes by itself.

export default (prov: TestProvision) => {
  const worker = getJabWorker_sub_spawn(prov, {
    filename: "hello.js",
    collectSubprocesses: true,
  });

  return worker.waiter.await("stopped").then(() => {
    return worker.killSubprocesses();
  });
};
