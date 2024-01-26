import { TestProvision } from "^jarun";
import { getJabWorker } from "../_fixture";

//worker shutdown itself

export default (prov: TestProvision) => {
  const worker = getJabWorker(prov);

  return worker.waiter.await("stopped", 10000);
};
