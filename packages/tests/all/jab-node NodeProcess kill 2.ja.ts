import { TestProvision } from "^jarun";

import { getNodeProcess_ready } from "../_fixture";

export default (prov: TestProvision) =>
  getNodeProcess_ready(prov).then((proc) => proc.noisyKill());
