import { TestProvision } from "^jarun";

import { getNodeProcess } from "../_fixture";

export default (prov: TestProvision) => getNodeProcess(prov).kill();
