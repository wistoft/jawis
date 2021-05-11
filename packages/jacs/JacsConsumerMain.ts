import { parentPort, workerData } from "worker_threads";

import { install } from "./JacsConsumerMainImpl";

if (!parentPort) {
  throw new Error("You should be there for me");
}

install(workerData);
