import { TestProvision } from "^jarun";

import { getJabBeePreloader } from "../_fixture";

//shutdown correctly.

export default (prov: TestProvision) => getJabBeePreloader(prov).shutdown();
