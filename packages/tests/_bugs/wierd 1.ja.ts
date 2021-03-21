import { TestProvision } from "^jarun";

import { parentPort } from "worker_threads";

// compile succeeds

export default (prov: TestProvision) => {
  parentPort!.postMessage("blabla");
};
