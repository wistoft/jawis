import { TestProvision } from "^jarun";
import { sleeping } from "^jab";

import { getJabWatchableProcess_ipc_changeable } from "../_fixture";
import { writeScriptFileThatChanges } from "^tests/_fixture/util/diverse";

// a file changes (simple :-)

export default (prov: TestProvision) =>
  getJabWatchableProcess_ipc_changeable(prov).then((wp) => {
    //todo: wait for message form helloIpc2.js, instead of sleeping
    return sleeping(200)
      .then(() => {
        writeScriptFileThatChanges(1000);
      })
      .then(() => {
        //todo: wait for restart event  (see `watch 2`)
        return sleeping(100);
      })
      .then(wp.shutdown);
  });
