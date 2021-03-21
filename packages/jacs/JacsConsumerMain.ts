import fs from "fs";
import { parentPort, workerData } from "worker_threads";
import * as tsConfigPaths from "tsconfig-paths";
import sourceMapSupport from "source-map-support";

import { def } from "^jab";
import { nodeRequire } from "^jab-node";

import { unRegisterTsCompiler, WorkerData } from ".";
import { JacsConsumer } from "./JacsConsumer";

//get deps

if (!parentPort) {
  throw new Error("You should be there for me");
}

const shared = workerData as WorkerData;

//unregister - for development

if (shared.unregister) {
  unRegisterTsCompiler();
}

//setup ts paths

if (!fs.existsSync(def(shared.absBaseUrl))) {
  throw new Error("JacsConsumerMain: BaseUrl must exist: " + shared.absBaseUrl);
}

if (shared.absBaseUrl && shared.paths) {
  tsConfigPaths.register({
    baseUrl: shared.absBaseUrl,
    paths: shared.paths,
  });
}

//setup source map

sourceMapSupport.install({
  handleUncaughtExceptions: false,
  environment: "node",
  hookRequire: true,
});

//setup jacs

const onError = (error: unknown) => {
  console.log("JacsConsumer.onError: ", error);
};

const consumer = new JacsConsumer({
  shared: workerData,
  onError,
});

consumer.register();

//run the thing.

nodeRequire(shared.beeFilename);
