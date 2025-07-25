import { TestProvision } from "^jarun";

import { getNodeProcess } from "../_fixture";

//shutdown process, that stops itself.

export default (prov: TestProvision) => getNodeProcess(prov).shutdown();
