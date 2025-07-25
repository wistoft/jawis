import { TestProvision } from "^jarun";

import { getJabBeePreloader } from "../_fixture";

export default (prov: TestProvision) => getJabBeePreloader(prov).noisyKill();
