import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import {
  writeScriptFileThatChanges,
  getJabWatchableProcess_nonIpc_changeable,
} from "../_fixture";

// change after script ended itself. That should have no effect.

export default (prov: TestProvision) =>
  getJabWatchableProcess_nonIpc_changeable(prov).then(() =>
    sleeping(200).then(() => {
      writeScriptFileThatChanges(1000);
      return sleeping(100);
    })
  );
