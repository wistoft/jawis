import { workerData } from "node:worker_threads";

import { install } from "./internal";

install(workerData);
