import { TestProvision } from "^jarun";

import { getJabProcess_ready, shutdownQuickFix } from "../_fixture";

export default (prov: TestProvision) =>
  getJabProcess_ready(prov).then((proc) => shutdownQuickFix(proc));
