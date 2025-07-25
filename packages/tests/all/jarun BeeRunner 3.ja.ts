import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { getScriptPath, brRunTest } from "../_fixture";

//test can be killed.

export default (prov: TestProvision) => {
  const { br, promise } = brRunTest(prov, getScriptPath("silentWait.js"));

  return sleeping(10)
    .then(br.kill)
    .then(() => promise);
};
