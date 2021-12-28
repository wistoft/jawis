import { TestProvision } from "^jarun";
import { getScriptPath, makeTsWorker_test } from "../_fixture";

// ipc message is received from script

export default (prov: TestProvision) => {
  const { worker, exitPromise: promiseExit } = makeTsWorker_test(
    prov,
    getScriptPath("beeSend.js")
  );

  worker.addListener("message", prov.imp);

  return promiseExit;
};
