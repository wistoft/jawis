import { TestProvision } from "^jarun";

import { getJabProcessPreloader } from "../_fixture";

//shutdown correctly.

export default (prov: TestProvision) => getJabProcessPreloader(prov).shutdown();
