import { TestProvision } from "^jarun";

import { getJabProcessPreloader } from "../_fixture";

export default (prov: TestProvision) =>
  getJabProcessPreloader(prov).noisyKill();
