import { TestProvision } from "^jarun";
import { getJabWorker, getScriptPath } from "../_fixture";

//shutdown, when worker has to be ready.

export default (prov: TestProvision) => {
  const worker = getJabWorker(prov, {
    filename: getScriptPath("ipcSendOnly.js"),
  });

  return worker.waiter.await("message").then(() => worker.shutdown());
};
