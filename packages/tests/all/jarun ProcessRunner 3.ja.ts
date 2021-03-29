import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

import { getScriptPath, prRunTest } from "../_fixture";

//test can be killed.

export default (prov: TestProvision) => {
  const { pr, promise } = prRunTest(prov, getScriptPath("eternalIpc.js"));

  return sleeping(1000).then(() => pr.kill().then(() => promise));
};
