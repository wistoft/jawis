import { parentPort, workerData } from "worker_threads";

import { install } from "./JacsConsumerMainImpl";
import { unRegisterTsCompiler } from "./util";

if (!parentPort) {
  throw new Error("You should be there for me");
}

//unregister - for development

if (workerData.unregister) {
  //this should be done elsewhere. Because we don't know which compiler to uninstall.
  unRegisterTsCompiler();
}

//start

install(workerData);
