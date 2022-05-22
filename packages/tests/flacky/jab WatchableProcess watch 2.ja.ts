import { TestProvision } from "^jarun";
import { sleeping, getPromise } from "^jab";

import {
  getJabWatchableProcess_ipc_changeable,
  writeScriptFileThatChanges,
} from "../_fixture";

//same file change after restart event as fired.

export default (prov: TestProvision) => {
  const { promise, resolve } = getPromise<void>();

  return getJabWatchableProcess_ipc_changeable(prov, {
    onRestartNeeded: () => {
      resolve();
      prov.imp("onRestartNeeded.");
    },
  }).then((wp) => {
    //todo: wait for message form helloIpc2.js, instead of sleeping.
    // But `require` messages are in the way. Filter?
    return sleeping(200)
      .then(() => {
        writeScriptFileThatChanges(1000);
        return promise;
      })
      .then(() => {
        writeScriptFileThatChanges(2000);
        return sleeping(200);
      })
      .then(wp.shutdown);
  });
};
