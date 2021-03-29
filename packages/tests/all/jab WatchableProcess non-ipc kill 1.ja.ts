import { TestProvision } from "^jarun";

import { getJabWatchableProcess_nonIpc_changeable } from "../_fixture";

//flacky, because the script maybe execute something.

//
export default (prov: TestProvision) =>
  getJabWatchableProcess_nonIpc_changeable(prov, {
    onExit: () => {
      console.log("exit");
    },
  }).then((wp) => wp.noisyKill());
