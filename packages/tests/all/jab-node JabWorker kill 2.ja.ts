import { TS_TIMEOUT } from "^jab-node";
import { TestProvision } from "^jarun";
import { getJabWorker, getScriptPath } from "../_fixture";

//kill running worker

export default (prov: TestProvision) => {
  const worker = getJabWorker(prov, {
    filename: getScriptPath("beeSend.js"),
  });

  return worker.waiter.await("message", TS_TIMEOUT).then(worker.kill);
};
