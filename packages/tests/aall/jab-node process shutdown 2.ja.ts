import { TestProvision } from "^jarun";

import { getJabProcess } from "../_fixture";

//shutdown process, that stops itself.

export default (prov: TestProvision) => getJabProcess(prov).shutdown();
