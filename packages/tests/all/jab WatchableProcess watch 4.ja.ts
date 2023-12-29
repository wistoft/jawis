import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import {
  getJabWatchableProcess_ipc_changeable,
  shutdownQuickFix,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from "../_fixture";

// change after shutdown

export default (prov: TestProvision) =>
  getJabWatchableProcess_ipc_changeable(prov).then((wp) => {
    //todo: wait for message form helloIpc2.js, instead of sleeping
    return sleeping(200)
      .then(() => shutdownQuickFix(wp))
      .then(() => {
        writeScriptFileThatChanges(1000);
        writeScriptFileThatChanges2(2000);
        return sleeping(100);
      });
  });
