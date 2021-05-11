import { TestProvision } from "^jarun";
import { sleeping } from "^jab";

import { getJabWatchableProcess_nonIpc_changeable } from "../_fixture";
import { writeScriptFileThatChanges } from "^tests/_fixture/util/diverse";

// change after script ended itself. That should have no effect.

export default (prov: TestProvision) =>
  getJabWatchableProcess_nonIpc_changeable(prov).then(() =>
    sleeping(200).then(() => {
      writeScriptFileThatChanges(1000);
      return sleeping(100);
    })
  );
