import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import { getJabWatchableProcess_nonIpc_changeable } from "../_fixture";

// doesn't shutdown, but that's no error, because the script exits itself.

export default (prov: TestProvision) =>
  getJabWatchableProcess_nonIpc_changeable(prov, {
    onExit: () => {
      console.log("exit");
    },
  }).then(() => sleeping(200));
