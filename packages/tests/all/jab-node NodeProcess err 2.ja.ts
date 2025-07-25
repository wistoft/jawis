import { TestProvision } from "^jarun";

import { getNodeProcess, getScriptPath } from "../_fixture";

//When await times out, it shouldn't be waited for any more.

export default (prov: TestProvision) => {
  const process = getNodeProcess(prov, {
    filename: getScriptPath("silentWait.js"),
  });

  //timeout waiting for message
  return (
    process.waiter
      .await("message", 1)
      // another error would happen here, if await weren't cancelled on timeout.
      .finally(process.noisyKill)
  );
};
