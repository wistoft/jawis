import { TestProvision } from "^jarun";

import { getJabProcess, getScriptPath } from "../_fixture";

//When await times out, it shouldn't be waited for any more.

export default (prov: TestProvision) => {
  const process = getJabProcess(prov, {
    filename: getScriptPath("silentWait.js"),
  });

  //timeout waiting for message
  return (
    process.waiter
      .await("message")
      // another error would happen here, if await weren't cancelled on timeout.
      .finally(process.noisyKill)
  );
};
