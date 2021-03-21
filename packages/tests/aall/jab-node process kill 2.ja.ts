import { TestProvision } from "^jarun";

import { getJabProcess_ready } from "../_fixture";

export default (prov: TestProvision) =>
  getJabProcess_ready(prov).then((proc) => proc.noisyKill());
