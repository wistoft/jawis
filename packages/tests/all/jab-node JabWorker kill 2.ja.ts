import { TestProvision } from "^jarun";
import { getJabWorker, getScriptPath } from "../_fixture";

//kill running worker

export default (prov: TestProvision) => {
  const worker = getJabWorker(prov, {
    filename: getScriptPath("ipcSendOnly.js"),
  });

  return worker.waiter.await("message").then(worker.kill);
};
