import { TestProvision } from "^jarun";

import { getJabProcess } from "../_fixture";

export default (prov: TestProvision) => getJabProcess(prov).kill();
