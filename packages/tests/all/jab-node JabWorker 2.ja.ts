import { TestProvision } from "^jarun";
import { getJabWorker, getScriptPath } from "../_fixture";

//shutdown, when worker has to be ready.

export default (prov: TestProvision) => {
  const worker = getJabWorker(prov, {
    filename: getScriptPath("beeSend.js"),
  });

  return worker.waiter.await("message", 10000).then(() => worker.shutdown());
};
