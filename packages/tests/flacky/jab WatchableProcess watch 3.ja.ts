import { TestProvision } from "^jarun";
import { sleeping } from "^jab";

import {
  getJabWatchableProcess_ipc_changeable,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from "../_fixture";

// two different files change

export default (prov: TestProvision) =>
  getJabWatchableProcess_ipc_changeable(prov).then((wp) => {
    //todo: wait for message form helloIpc2.js, instead of sleeping
    return sleeping(200)
      .then(() => {
        writeScriptFileThatChanges(1000);
        writeScriptFileThatChanges2(2000);
      })
      .then(() => {
        //todo: wait for restart event  (see `watch 2`)
        return sleeping(100);
      })
      .then(wp.shutdown);
  });
